import flat from "array.prototype.flat";
import equal from "fast-deep-equal/es6";
import { TFile } from "obsidian";

import ALxFolderNote from "../fn-main";

export type fileMetaMap = Map<string, Set<string>>;
export type BreadMeta = {
  parents: fileMetaMap;
  children: fileMetaMap;
};

// eslint-disable-next-line prefer-arrow/prefer-arrow-functions
export function updateBreadMeta(this: ALxFolderNote, files?: TFile | TFile[]) {
  files = files
    ? Array.isArray(files)
      ? files
      : [files]
    : this.app.vault.getFiles();
  const mdList = files.filter((v) => v.extension === "md");
  for (const file of mdList) {
    setBreadMetaForFile(this, file, false);
  }
  this.app.metadataCache.trigger("bread-meta-resolved", this.breadMeta);
}

export const getSoftChildren = (file: TFile, plugin: ALxFolderNote) => {
  const { parents, children } = plugin.breadMeta;
  const { metadataCache, vault } = plugin.app;
  const roughMatch = (linktext: string) =>
    linktext.endsWith(file.basename) || linktext.endsWith(file.name);
  const childrenList: TFile[] = [];
  const pushToList = (file: TFile) => {
    if (childrenList.every((f) => f.path !== file.path))
      childrenList.push(file);
  };
  for (const [path, linktexts] of parents) {
    let match = false;
    linktexts.forEach((v) => {
      if (roughMatch(v)) match = true;
    });
    if (
      match &&
      [...linktexts]
        .filter((v) => roughMatch(v))
        .map((v) => metadataCache.getFirstLinkpathDest(v, path))
        .some((parent) => parent && parent.path === file.path)
    ) {
      const result = vault.getAbstractFileByPath(path);
      if (result && result instanceof TFile) pushToList(result);
      else console.warn("unable to find file from path %s", path, parents);
    }
  }
  children.get(file.path)?.forEach((v) => {
    const result = metadataCache.getFirstLinkpathDest(v, file.path);
    if (result) pushToList(result);
  });
  return childrenList;
};

const setBreadMetaForFile = (
  plugin: ALxFolderNote,
  file: TFile,
  triggerEvt = true,
) => {
  const { parents, children } = plugin.breadMeta;
  const { metadataCache } = plugin.app;
  const path = file.path,
    fm = metadataCache.getFileCache(file)?.frontmatter;

  const { parentsFieldName: parentField, childrenFieldName: childField } =
    plugin.settings.breadcrumbs;
  const getVal = (val: any): Set<string> | null => {
    if (typeof val === "string") return new Set([val]);
    if (Array.isArray(val)) return new Set(flat(val, Infinity));
    return null;
  };
  const setVal = (
    key: string,
    newVal: Set<string> | null,
    map: fileMetaMap,
  ): boolean => {
    if (newVal === null && map.has(key))
      // remove val
      return map.delete(key);
    if (
      (newVal !== null && !map.has(key)) || // add new val
      (newVal && map.has(key) && !equal(map.get(key), newVal)) // update val
    )
      return !!map.set(key, newVal);

    return false;
  };

  const result1 = setVal(path, fm ? getVal(fm[parentField]) : null, parents);
  const result2 = setVal(path, fm ? getVal(fm[childField]) : null, children);
  if (triggerEvt)
    plugin.app.metadataCache.trigger(
      "bread-meta-changed",
      path,
      plugin.breadMeta,
    );
  return result1 || result2;
};
