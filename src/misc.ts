import assertNever from "assert-never";
import {
  AFItem,
  FolderItem,
  Modifier,
  TAbstractFile,
  TFile,
  TFolder,
} from "obsidian";
import { dirname, extname, join } from "path-browserify";

export type afItemMark = AFItem & {
  evtDone?: true;
  isFolderNote?: true;
  isFolderWithNote?: true;
};

export const isFolder = (item: AFItem): item is FolderItem =>
  (item as FolderItem).file instanceof TFolder;

export const isMd = (file: TFile | string) =>
  typeof file === "string" ? extname(file) === ".md" : file.extension === "md";

export const isMac = () => navigator.userAgent.includes("Macintosh");

export enum NoteLoc {
  Index,
  Inside,
  Outside,
}

export const isModifier = (evt: MouseEvent, pref: Modifier): boolean => {
  const { altKey, metaKey, ctrlKey, shiftKey } = evt;
  switch (pref) {
    case "Mod":
      return isMac() ? metaKey : ctrlKey;
    case "Ctrl":
      return ctrlKey;
    case "Meta":
      return metaKey;
    case "Shift":
      return shiftKey;
    case "Alt":
      return altKey;
    default:
      assertNever(pref);
  }
};

/**
 * @param newName include extension
 */
export const getRenamedPath = (af: TAbstractFile, newName: string) =>
  join(getParentPath(af.path), newName);

export const getParentPath = (src: string) => {
  const path = dirname(src);
  if (path === ".") return "/";
  else return path;
};
