import ALxFolderNote from "main";
import { TFile, TFolder } from "obsidian";
import { parse, dirname } from "path";
import { NoteLoc } from "misc";
import assertNever from "assert-never";

export const getParentPath = (src: string) => {
  const path = dirname(src);
  if (path === ".") return "/";
  else return path;
};

export function findFolderNote(
  findIn: TFolder,
  noteBaseName: string,
): TFile | null {
  const found = findIn.children.find(
    (af) =>
      af instanceof TFile &&
      af.basename === noteBaseName &&
      af.extension === "md",
  );
  return (found as TFile) ?? null;
}

function getParent(path: string, plugin: ALxFolderNote): TFolder | null {
  try {
    return (
      (plugin.app.vault.getAbstractFileByPath(
        getParentPath(path),
      ) as TFolder) ?? null
    );
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function findFolderFromNote(
  plugin: ALxFolderNote,
  file: TFile | string,
): TFolder | null {
  try {
    let parent: TFolder | null, base: string;
    if (file instanceof TFile) {
      parent = file.parent;
      base = file.basename;
    } else {
      parent = getParent(file, plugin);
      base = parse(file).name;
    }
    if (!parent) return null;
    switch (plugin.settings.folderNotePref) {
      case NoteLoc.Index:
        if (base === plugin.settings.indexName) return parent;
        else return null;
      case NoteLoc.Inside:
        if (parent.name === base) return parent;
        else return null;
      case NoteLoc.Outside:
        const found = parent.children.find(
          (af) => af instanceof TFolder && af.name === base,
        );
        return (found as TFolder) ?? null;
      default:
        assertNever(plugin.settings.folderNotePref);
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function getAbstractFolderNote(
  plugin: ALxFolderNote,
  path: string,
  folder: TFolder,
): {
  findIn: TFolder;
  noteBaseName: string;
};
export function getAbstractFolderNote(
  plugin: ALxFolderNote,
  folder: TFolder,
): {
  findIn: TFolder;
  noteBaseName: string;
};
export function getAbstractFolderNote(
  plugin: ALxFolderNote,
  src: TFolder | string,
  baseFolder?: TFolder,
): {
  findIn: TFolder;
  noteBaseName: string;
} {
  const getParent = (): TFolder => {
    if (typeof src === "string") {
      const found = plugin.app.vault.getAbstractFileByPath(getParentPath(src));
      if (found && found instanceof TFolder) return found;
      else {
        console.error(src, getParentPath(src));
        throw new Error("invalid path given");
      }
    } else {
      if (src.parent === undefined) {
        // root folder
        return src;
      } else if (src.parent === null) {
        // when the folder is a deleted one
        const parentPath = getParentPath(src.path);
        const foundParent = plugin.app.vault.getAbstractFileByPath(parentPath);
        if (foundParent && foundParent instanceof TFolder)
          return foundParent as TFolder;
        else {
          console.error(src);
          throw new Error("no parent folder found");
        }
      } else return src.parent;
    }
  };
  const { indexName, folderNotePref: folderNoteLoc } = plugin.settings;
  let findIn: TFolder, noteBaseName: string;

  switch (folderNoteLoc) {
    case NoteLoc.Index:
      noteBaseName = indexName;
      break;
    case NoteLoc.Inside:
    case NoteLoc.Outside:
      if (typeof src === "string") noteBaseName = parse(src).name;
      else
        noteBaseName = src.name === "/" ? plugin.app.vault.getName() : src.name;
      break;
    default:
      assertNever(folderNoteLoc);
  }
  switch (folderNoteLoc) {
    case NoteLoc.Index:
    case NoteLoc.Inside:
      if (typeof src === "string") {
        if (!baseFolder) throw new TypeError("baseFolder not provided");
        findIn = baseFolder;
      } else findIn = src;
      break;
    case NoteLoc.Outside:
      findIn = getParent();
      break;
    default:
      assertNever(folderNoteLoc);
  }
  return { findIn, noteBaseName };
}
