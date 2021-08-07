import flat from "array.prototype.flat";
import assertNever from "assert-never";
import { is, isRecord, isSet, Map, Record, RecordOf, Set } from "immutable";
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
    name:
      | "parent-added"
      | "children-removed"
      | "children-added"
      | "parent-removed",
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
    name:
      | "parent-added"
      | "children-removed"
      | "children-added"
      | "parent-removed",
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

  private getValFromFmField(
    key: "parents" | "children",
    file: TFile,
  ): Set<string> | null {
    const fm = this.app.metadataCache.getFileCache(file)?.frontmatter;
    if (fm) {
      const val = fm[this.settings.fieldNames[key]];
      if (typeof val === "string") return Set([val]);
      if (Array.isArray(val)) return Set(flat(val, Infinity));
    }
    return null;
  }

  /**
   * @returns return false if no changes in frontmatter
   */
  private getVaildPathsFromFmField(
    key: "parents" | "children",
    file: TFile,
  ): Set<string> | null | false {
    const val = this.getValFromFmField(key, file),
      targetPath = file.path;

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
        const vaildPath = this.app.metadataCache.getFirstLinkpathDest(
          val,
          targetPath,
        );
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
  }

  private updateFromFmField(
    key: "parents" | "children",
    file: TFile,
  ): [added: Set<string> | null, removed: Set<string> | null] {
    const targetPath = file.path;

    let added: Set<string> | null, removed: Set<string> | null;
    // get from children field
    const fmPaths = this.getVaildPathsFromFmField(key, file);
    if (fmPaths !== false) {
      type mergeMap = Map<string, Map<string, AlterOp>>;
      /** get all cached relation for given file and marked them remove */
      const fetchFromCache = (): mergeMap => {
        let tree: mergeMap;
        if (key === "parents") {
          const type = LinkType.softOut,
            fillWith = getToggle("remove", type);
          const srcParents = this.parentsCache.get(targetPath);
          tree = Map<string, Map<string, AlterOp>>();
          if (srcParents)
            tree = tree.set(
              targetPath,
              srcParents.filter((types) => types.has(type)).map(() => fillWith),
            );
          return tree;
        } else if (key === "children") {
          const type = LinkType.softIn,
            fillWith = getToggle("remove", type, targetPath);
          return this.parentsCache
            .filter((parents) => !!parents.get(targetPath)?.has(type))
            .map(() => fillWith);
        } else assertNever(key);
      };
      /** fetch relation from file's fm and mark them add */
      const fetchFromFm = (
        tree: mergeMap,
      ): [fetched: mergeMap, added: Set<string>] => {
        if (fmPaths !== null) {
          let addFromPaths: mergeMap, added: Set<string>;
          if (key === "parents") {
            const type = LinkType.softOut,
              fillWith = getToggle("add", type);
            addFromPaths = Map<string, Map<string, AlterOp>>().withMutations(
              (m) =>
                fmPaths.isEmpty() ||
                m.set(
                  targetPath,
                  fmPaths.toMap().map(() => fillWith),
                ),
            );
            added = fmPaths.subtract(tree.get(targetPath)?.keySeq() ?? []);
          } else if (key === "children") {
            const type = LinkType.softIn,
              fillWith = getToggle("add", type, targetPath);
            addFromPaths = fmPaths.toMap().map(() => fillWith);
            added = fmPaths.subtract(tree.keySeq());
          } else assertNever(key);
          return [tree.merge(addFromPaths), added];
        } else return [tree, Set()];
      };
      const [newTree, a] = fetchFromFm(fetchFromCache());

      added = a;
      // get removed
      if (key === "parents") {
        const entry = newTree.get(targetPath);
        if (entry) {
          removed = entry
            .filter((v) => !isSet(v))
            .keySeq()
            .toSet();
        } else if (newTree.isEmpty()) removed = Set();
        else
          throw new Error(
            "No entry for targetPath & not empty when setiing up parent",
          );
      } else if (key === "children") {
        removed = newTree
          .filter((v) => v.has(targetPath) && !isSet(v.get(targetPath)))
          .keySeq()
          .toSet();
      } else assertNever(key);

      // merge into parentCache
      if (!newTree.isEmpty()) {
        const merge = (oldVal: unknown, newVal: unknown, key: unknown) => {
          if (typeof newVal === "number" && newVal in LinkType && isSet(oldVal))
            return oldVal.delete(newVal);
          else {
            console.warn(`unexpected merge: @${key}, %o -> %o`, oldVal, newVal);
            return newVal;
          }
        };
        // @ts-ignore
        this.parentsCache = this.parentsCache.mergeDeepWith(merge, newTree);

        // delete key with empty types
        if (removed && !removed.isEmpty()) {
          const keys = removed;
          if (key === "parents")
            this.parentsCache = this.parentsCache.update(
              targetPath,
              // @ts-ignore
              (entry) => {
                return entry?.withMutations((m) =>
                  keys.forEach((key) => m.get(key)?.isEmpty() && m.delete(key)),
                );
              },
            );
          else if (key === "children")
            this.parentsCache = this.parentsCache.withMutations((m) =>
              keys.forEach((key) => {
                if ((m.getIn([key, targetPath]) as Set<SoftLink>).isEmpty())
                  m.deleteIn([key, targetPath]);
              }),
            );
          else assertNever(key);
        }
      }
    } else {
      added = null;
      removed = null;
    }

    return [added, removed];
  }

  /** read soft links defined in given file and update relationCache */
  private setCacheFromFile(file: TFile, triggerEvt = true) {
    const [addedFromP, removedFromP] = this.updateFromFmField("parents", file);
    const [addedFromC, removedFromC] = this.updateFromFmField("children", file);
    if (triggerEvt) {
      const trigger = (
        op: Operation,
        fromC: Set<string> | null,
        fromP: Set<string> | null,
      ) => {
        const notEmpty = (set: typeof fromC): set is Set<string> =>
          !!set && !set.isEmpty();
        if (notEmpty(fromC) || notEmpty(fromP)) {
          const parentAffected = Set<string>().withMutations((m) => {
            if (fromP && !fromP.isEmpty()) m.add(file.path);
            if (fromC) m.merge(fromC);
          });
          const childrenAddedTo = Set<string>().withMutations((m) => {
            if (fromC && !fromC.isEmpty()) m.add(file.path);
            if (fromP) m.merge(fromP);
          });
          if (notEmpty(parentAffected)) {
            const evt =
              op === "add"
                ? "parent-added"
                : op === "remove"
                ? "parent-removed"
                : assertNever(op);
            this.trigger(evt, parentAffected, this);
          }
          if (notEmpty(childrenAddedTo)) {
            const evt =
              op === "add"
                ? "children-added"
                : op === "remove"
                ? "children-removed"
                : assertNever(op);
            this.trigger(evt, childrenAddedTo, this);
          }
        }
      };
      trigger("add", addedFromC, addedFromP);
      trigger("remove", removedFromC, removedFromP);
    }
    // console.log(
    //   `parents of ${targetPath} added: %o, parents of ${targetPath} removed: %o`,
    //   addedFromC?.toJS(),
    //   removedFromC?.toJS(),
    // );
    // console.log(
    //   `added parent ${targetPath} to %o, removed parent ${targetPath} from %o`,
    //   addedFromP?.toJS(),
    //   removedFromP?.toJS(),
    // );
  }
}

type Operation = "add" | "remove";
type AlterOp = Set<SoftLink> | SoftLink;
function getToggle(op: Operation, type: LinkType.softOut): AlterOp;
function getToggle(
  op: Operation,
  type: LinkType.softIn,
  targetPath: string,
): Map<string, AlterOp>;
// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
function getToggle(
  op: Operation,
  type: SoftLink,
  targetPath?: string,
): AlterOp | Map<string, AlterOp> {
  let types: AlterOp;
  if (op === "add") {
    types = Set<SoftLink>([type]);
  } else if (op === "remove") {
    types = type;
  } else assertNever(op);

  if (type === LinkType.softIn) {
    if (!targetPath) throw new Error("No targetPath given when setting toggle");
    return Map({ [targetPath]: types });
  } else if (type === LinkType.softOut) {
    return types;
  } else assertNever(type);
}
