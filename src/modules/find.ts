import ALxFolderNote from "main";
import { TFile, TFolder } from "obsidian";
import { basename, dirname } from "path";
import { NoteLoc } from "settings";
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

export function getAbstractFolderNote(
  this: ALxFolderNote,
  path: string,
  folder: TFolder,
): {
  findIn: TFolder;
  noteBaseName: string;
};
export function getAbstractFolderNote(
  this: ALxFolderNote,
  folder: TFolder,
): {
  findIn: TFolder;
  noteBaseName: string;
};
export function getAbstractFolderNote(
  this: ALxFolderNote,
  src: TFolder | string,
  baseFolder?: TFolder,
): {
  findIn: TFolder;
  noteBaseName: string;
} {
  const getParent = (): TFolder => {
    if (typeof src === "string") {
      const found = this.app.vault.getAbstractFileByPath(getParentPath(src));
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
        const foundParent = this.app.vault.getAbstractFileByPath(parentPath);
        if (foundParent && foundParent instanceof TFolder)
          return foundParent as TFolder;
        else {
          console.error(src);
          throw new Error("no parent folder found");
        }
      } else return src.parent;
    }
  };
  const { indexName, folderNotePref: folderNoteLoc } = this.settings;
  let findIn: TFolder, noteBaseName: string;

  switch (folderNoteLoc) {
    case NoteLoc.Index:
      noteBaseName = indexName;
      break;
    case NoteLoc.Inside:
    case NoteLoc.Outside:
      if (typeof src === "string") noteBaseName = basename(src);
      else
        noteBaseName = src.name === "/" ? this.app.vault.getName() : src.name;
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
