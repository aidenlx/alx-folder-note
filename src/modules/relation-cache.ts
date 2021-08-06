import flat from "array.prototype.flat";
import { is, isSet, Map, Seq, Set } from "immutable";
import { EventRef, Events, TFile } from "obsidian";

import { LinkType, SoftLink } from "../components/tools";
import ALxFolderNote from "../fn-main";

export type RelationInField = "parents" | "children";

// parentsCache: {
//   // File_Parents
//   file1: {
//     // File_Types
//     parent1: [softout, softIn],
//     parent2: [softout],
//   },
//   file2: {
//     parent1: [softIn],
//   }
// }
type File_Parents = Map<string /*filePath*/, File_Types>;
type File_Types = Map<string /* parentPath */, Set<SoftLink>>;

export default class RelationCache extends Events {
  plugin: ALxFolderNote;
  private get app() {
    return this.plugin.app;
  }
  private get settings() {
    return this.plugin.settings.relation;
  }
  // @ts-ignore
  parentsCache: File_Parents = Map();
  // @ts-ignore
  private fmCache: Map<string, Map<RelationInField, Set<string> | null>> =
    Map();

  getParentsOf(filePath: string): Set<string> | null {
    return this.parentsCache.get(filePath)?.keySeq().toSet() ?? null;
  }
  getParentsWithTypes(filePath: string): File_Types | null {
    return this.parentsCache.get(filePath, null);
  }
  getChildrenOf(filePath: string): Set<string> | null {
    const result = this.parentsCache
      .toSeq()
      .filter((ft) => ft.has(filePath))
      .keySeq();
    return result.isEmpty() ? null : result.toSet();
  }
  getChildrenWithTypes(filePath: string): File_Types | null {
    const revert = (type: SoftLink) =>
      type === LinkType.softIn ? LinkType.softOut : LinkType.softIn;
    const result = this.parentsCache
      .toSeq()
      .filter((ft) => ft.has(filePath))
      .map((ft) => (ft.get(filePath) as Set<SoftLink>).map((t) => revert(t)));
    return result.isEmpty() ? null : result.toMap();
  }
  getSiblingsOf(filePath: string): Set<string> | null {
    const set = this.getParentsOf(filePath);
    if (!set) return null;

    const result = set
      .reduce((newSet, path) => {
        let children = this.getChildrenOf(path);
        if (children) return newSet.union(children);
        else return newSet;
      }, Set<string>())
      .delete(filePath);
    return result.isEmpty() ? null : result;
  }

  constructor(plugin: ALxFolderNote) {
    super();
    this.plugin = plugin;
    plugin.registerEvent(
      this.app.metadataCache.on("initialized", () => {
        this.updateCache();
      }),
    );
    if (this.app.metadataCache.initialized) this.updateCache();

    plugin.registerEvent(
      this.app.metadataCache.on("changed", (file) => {
        if (file.extension === "md") this.updateCache(file);
      }),
    );
  }
  on(
    name: "children-removed",
    callback: (affected: Set<string>, cache: RelationCache) => any,
    ctx?: any,
  ): EventRef;
  on(
    name: "children-added",
    callback: (affected: Set<string>, cache: RelationCache) => any,
    ctx?: any,
  ): EventRef;
  on(
    name: "parent-removed",
    callback: (affected: Set<string>, cache: RelationCache) => any,
    ctx?: any,
  ): EventRef;
  on(
    name: "parent-added",
    callback: (affected: Set<string>, cache: RelationCache) => any,
    ctx?: any,
  ): EventRef;
  on(
    name: "relation-resolved",
    callback: (cache: RelationCache) => any,
    ctx?: any,
  ): EventRef;
  on(name: string, callback: (...data: any) => any, ctx?: any): EventRef {
    return super.on(name, callback, ctx);
  }

  trigger(
    name: "children-removed",
    affected: Set<string>,
    cache: RelationCache,
  ): void;
  trigger(
    name: "children-added",
    affected: Set<string>,
    cache: RelationCache,
  ): void;
  trigger(
    name: "parent-removed",
    affected: Set<string>,
    cache: RelationCache,
  ): void;
  trigger(
    name: "parent-added",
    affected: Set<string>,
    cache: RelationCache,
  ): void;
  trigger(name: "relation-resolved", cache: RelationCache): void;
  trigger(name: string, ...data: any[]): void {
    super.trigger(name, ...data);
    this.app.metadataCache.trigger(name, ...data);
  }

  /**
   * @param files force update entire cache when not given
   */
  updateCache(files?: TFile | TFile[]) {
    const updateAll = files === undefined;
    files = files
      ? Array.isArray(files)
        ? files
        : [files]
      : this.app.vault.getMarkdownFiles();
    if (updateAll) this.parentsCache = this.parentsCache.clear();
    for (const file of files) {
      this.setCacheFromFile(file, !updateAll);
    }
    if (updateAll) this.trigger("relation-resolved", this);
  }

  /** read soft links defined in given file and update relationCache */
  private setCacheFromFile(file: TFile, triggerEvt = true) {
    const { metadataCache } = this.app;
    const targetPath = file.path,
      fm = metadataCache.getFileCache(file)?.frontmatter;

    const getValFromField = (
      key: "parents" | "children",
    ): Set<string> | null => {
      if (fm) {
        const val = fm[this.settings.fieldNames[key]];
        if (typeof val === "string") return Set([val]);
        if (Array.isArray(val)) return Set(flat(val, Infinity));
      }
      return null;
    };

    /**
     * @returns return false if no changes in frontmatter
     */
    const getVaildPathsFromField = (
      key: "parents" | "children",
    ): Set<string> | null | false => {
      const val = getValFromField(key);

      let cachedFm = this.fmCache.getIn([targetPath, key]) as
        | Set<string>
        | null
        | undefined;
      if (cachedFm !== undefined && is(val, cachedFm)) {
        return false;
      } else {
        this.fmCache = this.fmCache.setIn([targetPath, key], val);
      }

      if (!val) return null;
      else {
        const toVaildPath = (val: string) => {
          if (!val) return null;
          const vaildPath = metadataCache.getFirstLinkpathDest(val, targetPath);
          if (!vaildPath)
            console.warn(
              `Fail to get file from linktext ${val}, skipping... location: file ${targetPath} field ${this.settings.fieldNames[key]}`,
            );
          return vaildPath?.path ?? null;
        };
        return val
          .map(toVaildPath)
          .filter<string>((v): v is string => v !== null);
      }
    };

    /** @param op T:add; F:remove */
    function getToggle(op: boolean, type: LinkType.softOut): Set<SoftLink>;
    function getToggle(
      op: boolean,
      type: LinkType.softIn,
    ): Map<string, Set<SoftLink> | null>;
    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    function getToggle(
      op: boolean,
      type: SoftLink,
    ): Set<SoftLink> | Map<string, Set<SoftLink> | null> {
      if (type === LinkType.softIn) {
        return op
          ? Map({ [targetPath]: Set<SoftLink>([LinkType.softIn]) })
          : Map<string, Set<SoftLink> | null>({ [targetPath]: null });
      } else {
        return op ? Set([LinkType.softOut]) : Set();
      }
    }

    let addedFromP: Set<string> | null = null,
      removedFromP: Set<string> | null = null;
    // get from parent field
    const fmParents = getVaildPathsFromField("parents");
    if (fmParents !== false) {
      const type = LinkType.softOut,
        srcParents = this.parentsCache.get(targetPath);
      const fillWith = getToggle(false, type);
      let newTree =
        srcParents?.filter((types) => types.has(type)).map(() => fillWith) ??
        Map<string, Set<SoftLink>>();

      if (fmParents !== null) {
        addedFromP = fmParents.subtract(newTree.keySeq());
        const fillWith = getToggle(true, type);
        newTree = newTree.concat(fmParents.toMap().map(() => fillWith));
      } else addedFromP = Set();

      removedFromP = newTree
        .filter((v) => v.isEmpty())
        .keySeq()
        .toSet();

      // do merge here
      if (!newTree.isEmpty()) {
        const merge = (oldVal: Set<SoftLink>, newVal: Set<SoftLink>) =>
          newVal.isEmpty() ? oldVal.delete(type) : oldVal.add(type);
        const setTo: File_Types = srcParents
          ? srcParents.mergeWith(merge, newTree)
          : newTree.toMap();
        this.parentsCache = this.parentsCache.set(targetPath, setTo);
      }
    }

    let addedFromC: Set<string> | null = null,
      removedFromC: Set<string> | null = null;
    // get from children field
    const fmChildren = getVaildPathsFromField("children");
    if (fmChildren !== false) {
      const type = LinkType.softIn;
      let types;
      const fillWith = getToggle(false, type);
      let newTree = this.parentsCache
        .filter(
          (parents) => !!(types = parents.get(targetPath)) && types.has(type),
        )
        .map(() => fillWith);

      if (fmChildren !== null) {
        addedFromC = fmChildren.subtract(newTree.keySeq());
        const fillWith = getToggle(true, type);
        newTree = newTree.concat(fmChildren.toMap().map(() => fillWith));
      } else addedFromC = Set();
      removedFromC = newTree
        .filter((v) => v.get(targetPath) === null)
        .keySeq()
        .toSet();

      if (!newTree.isEmpty()) {
        const merge = (oldVal: unknown, newVal: unknown, key: unknown) => {
          if (key === targetPath && newVal === null && isSet(oldVal))
            return oldVal.clear();
          else {
            console.warn(
              "unexpected merge in key %s, %o -> %o",
              key,
              oldVal,
              newVal,
            );
            return newVal;
          }
        };
        // @ts-ignore
        this.parentsCache = this.parentsCache.mergeDeepWith(merge, newTree);
      }
    }

    // console.log(
    //   `parents of ${targetPath} added: %o, parents of ${targetPath} removed: %o`,
    //   added.toJS(),
    //   removed.toJS(),
    // );
    // console.log(
    //   `added parent ${targetPath} to %o, removed parent ${targetPath} from %o`,
    //   added2.toJS(),
    //   removed2.toJS(),
    // );
    if (triggerEvt) {
      if (
        (addedFromC && !addedFromC.isEmpty()) ||
        (addedFromP && !addedFromP.isEmpty())
      ) {
        const parentAddedTo = Set<string>().withMutations((m) => {
          if (addedFromP && !addedFromP.isEmpty()) m.add(targetPath);
          if (addedFromC) m.merge(addedFromC);
        });
        const childrenAddedTo = Set<string>().withMutations((m) => {
          if (addedFromC && !addedFromC.isEmpty()) m.add(targetPath);
          if (addedFromP) m.merge(addedFromP);
        });
        if (!parentAddedTo.isEmpty())
          this.trigger("parent-added", parentAddedTo, this);
        if (!childrenAddedTo.isEmpty())
          this.trigger("children-added", childrenAddedTo, this);
      }
      if (
        (removedFromC && !removedFromC.isEmpty()) ||
        (removedFromP && !removedFromP.isEmpty())
      ) {
        const parentAddedTo = Set<string>().withMutations((m) => {
          if (removedFromP && !removedFromP.isEmpty()) m.add(targetPath);
          if (removedFromC) m.merge(removedFromC);
        });
        const childrenAddedTo = Set<string>().withMutations((m) => {
          if (removedFromC && !removedFromC.isEmpty()) m.add(targetPath);
          if (removedFromP) m.merge(removedFromP);
        });
        if (!parentAddedTo.isEmpty())
          this.trigger("parent-removed", parentAddedTo, this);
        if (!childrenAddedTo.isEmpty())
          this.trigger("children-removed", childrenAddedTo, this);
      }
    }
  }
}
