import flat from "array.prototype.flat";
import { is, Map, Record, RecordOf, Set } from "immutable";
import { EventRef, Events, TFile } from "obsidian";

import { LinkType, SoftLink } from "../components/tools";
import ALxFolderNote from "../fn-main";

export type RelationInField = "parents" | "children";

interface RLProps {
  path: string;
  type: SoftLink;
}
type RelationLink = RecordOf<RLProps>;
const RelationLink = Record<RLProps>({ path: "", type: LinkType.softIn });

// parentsCache: {
//   // File_Parents
//   file1: [
//     // RelationLink
//     [path: parent1, type: softout],
//     [path: parent1, type: softIn],
//     [path: parent2, type: softout],
//   ],
//   file2: {
//     [path: parent1, type: softIn],
//   }
// }
type File_Parents = Map<string /*filePath*/, Set<RelationLink>>;

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
  fmCache: Map<string, Map<RelationInField, Set<string> | null>> = Map();

  getParentsOf(filePath: string): Set<RelationLink> | null {
    return this.parentsCache.get(filePath, null);
  }
  getChildrenOf(filePath: string): Set<RelationLink> | null {
    const set = this.parentsCache.reduce((newSet, parents, key) => {
      let result;
      if ((result = parents.filter((rec) => rec.path === filePath)).isEmpty()) {
        return newSet; // filter not children
      } else {
        const revertType = (rec: RelationLink) =>
          rec.type === LinkType.softIn ? LinkType.softOut : LinkType.softIn;
        const converted = result.map((rec) =>
          rec.set("path", key).set("type", revertType(rec)),
        );
        return newSet.union(converted);
      }
    }, Set<RelationLink>());
    return set.isEmpty() ? null : set;
  }
  getSiblingsOf(filePath: string): Set<string> | null {
    const set = this.getParentsOf(filePath);
    if (!set) return null;

    const result = set
      .reduce((newSet, parent) => {
        let children = this.getChildrenOf(parent.path)?.map((rec) => rec.path);
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
      this.app.metadataCache.on("finished", () => {
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
    name: "relation-changed",
    callback: (file: TFile, cache: RelationCache) => any,
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

  trigger(name: "relation-changed", file: TFile, cache: RelationCache): void;
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
    const previousCache = this.parentsCache;
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

    // list of keys (file path) that should be checked empty (no parent specified, type)
    let shrinked: string[] = [];
    /** update parent-out */
    const updateFromParentsField = (): File_Parents => {
      const valsInField = getVaildPathsFromField("parents");
      // fm unchanged, do nothing
      if (valsInField === false) return this.parentsCache;

      if (valsInField === null) {
        let parents;
        if ((parents = this.parentsCache.get(targetPath))) {
          shrinked.push(targetPath);
          // clear all parent-out
          return this.parentsCache.set(
            targetPath,
            parents.filterNot((v) => v.type === LinkType.softOut),
          );
        }
      } else {
        const parentsList = valsInField.map((path) =>
          RelationLink({
            path,
            type: LinkType.softOut,
          }),
        );
        return this.parentsCache.update(targetPath, (parents) => {
          // if not created
          if (parents === undefined) return parentsList;
          else {
            shrinked.push(targetPath);
            return parents
              .filterNot((v) => v.type === LinkType.softOut)
              .union(parentsList);
          }
        });
      }
      return this.parentsCache;
    };
    /** update parent-in */
    const updateFromChildrenField = (): File_Parents => {
      const valsInField = getVaildPathsFromField("children");
      // fm unchanged, do nothing
      if (valsInField === false) return this.parentsCache;

      const target = RelationLink({ path: targetPath, type: LinkType.softIn });
      return this.parentsCache.map((fileParents, path) => {
        if (valsInField?.has(path)) return fileParents.add(target);
        else if (fileParents.has(target)) {
          shrinked.push(path);
          return fileParents.delete(target);
        }
        return fileParents;
      });
    };

    this.parentsCache = updateFromParentsField();
    this.parentsCache = updateFromChildrenField();

    for (const key of shrinked) {
      if (this.parentsCache.get(key)?.isEmpty())
        this.parentsCache = this.parentsCache.delete(targetPath);
    }
    if (triggerEvt && previousCache !== this.parentsCache)
      this.trigger("relation-changed", file, this);
  }
}
