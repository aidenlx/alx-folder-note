import assertNever from "assert-never";
import ALxFolderNote from "main";
import { NoteLoc } from "misc";
import { TFile, TFolder } from "obsidian";
import { basename, dirname, join, parse } from "path-browserify";

export const getParentPath = (src: string) => {
  const path = dirname(src);
  if (path === ".") return "/";
  else return path;
};

export const getFolderNote = (
  ...args:
    | [plugin: ALxFolderNote, path: string, folder: TFolder]
    | [plugin: ALxFolderNote, folder: TFolder]
): TFile | null => {
  const [plugin] = args;
  let r;
  if (typeof args[1] === "string" && args[2]) {
    const [, path, folder] = args;
    r = getAbstractFolderNote(plugin, path, folder);
  } else if (typeof args[1] !== "string") {
    const [, folder] = args;
    r = getAbstractFolderNote(plugin, folder);
  } else throw new TypeError("Invaild Arguments");
  return findFolderNote(plugin, r.findIn, r.noteBaseName);
};

export const findFolderNote = (
  plugin: ALxFolderNote,
  findIn: string,
  noteBaseName: string,
): TFile | null => {
  const findInFolder = plugin.app.vault.getAbstractFileByPath(findIn);
  if (findInFolder && findInFolder instanceof TFolder) {
    const found = findInFolder.children.find(
      (af) =>
        af instanceof TFile &&
        af.basename === noteBaseName &&
        af.extension === "md",
    );
    return (found as TFile) ?? null;
  } else return null;
};

const getParent = (path: string, plugin: ALxFolderNote): TFolder | null => {
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
};

const getFileInfo = (note: TFile | string) => {
  let parent: string, base: string;
  if (note instanceof TFile) {
    base = note.basename;
    parent = getParentPath(note.path);
  } else {
    base = parse(note).name;
    parent = getParentPath(note);
  }
  return { base, parent };
};

export const getFolderPath = (
  plugin: ALxFolderNote,
  note: TFile | string,
  newFolder = false,
): string => {
  const { parent, base } = getFileInfo(note);
  const getSiblingFolder = () => {
    if (parent === "/") return base;
    else return join(parent, base);
  };
  switch (plugin.settings.folderNotePref) {
    case NoteLoc.Index:
    case NoteLoc.Inside:
      if (newFolder) return getSiblingFolder();
      else return parent;
    case NoteLoc.Outside:
      return getSiblingFolder();
    default:
      assertNever(plugin.settings.folderNotePref);
  }
};

export const findFolderFromNote = (
  plugin: ALxFolderNote,
  note: TFile | string,
): TFolder | null => {
  const { parent, base } = getFileInfo(note);
  // check if folder note name vaild
  switch (plugin.settings.folderNotePref) {
    case NoteLoc.Index:
      if (base !== plugin.settings.indexName) return null;
      break;
    case NoteLoc.Inside:
      if (base !== basename(parent)) return null;
      break;
    case NoteLoc.Outside:
      break;
    default:
      assertNever(plugin.settings.folderNotePref);
  }
  const path = getFolderPath(plugin, note);
  if (path)
    return (plugin.app.vault.getAbstractFileByPath(path) as TFolder) ?? null;
  else return null;
};

export const getAbstractFolderNote = (
  ...args:
    | [plugin: ALxFolderNote, path: string, folder: TFolder]
    | [plugin: ALxFolderNote, folder: TFolder]
): {
  findIn: string;
  noteBaseName: string;
} => {
  const [plugin, src, baseFolder] = args;
  const getParent = (): string => {
    if (typeof src === "string") {
      return getParentPath(src);
    } else {
      if (src.parent === undefined) {
        // root folder
        return src.path;
      } else if (src.parent === null) {
        // when the folder is a deleted one
        return getParentPath(src.path);
      } else return src.parent.path;
    }
  };
  const { indexName, folderNotePref: folderNoteLoc } = plugin.settings;
  let findIn: string, noteBaseName: string;

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
        findIn = baseFolder.path;
      } else findIn = src.path;
      break;
    case NoteLoc.Outside:
      findIn = getParent();
      break;
    default:
      assertNever(folderNoteLoc);
  }
  return { findIn, noteBaseName };
};
