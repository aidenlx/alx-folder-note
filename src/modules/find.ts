import assertNever from "assert-never";
import { Notice, TFile, TFolder } from "obsidian";
import { basename, join, parse } from "path";

import ALxFolderNote from "../fn-main";
import { getParentPath, isMd, NoteLoc } from "../misc";

const getFileInfo = (
  note: TFile | string,
): { base: string; parent: string } => {
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

type folderNotePath = {
  info: [findIn: string, noteBaseName: string];
  path: string;
};
export default class NoteFinder {
  plugin: ALxFolderNote;
  constructor(plugin: ALxFolderNote) {
    this.plugin = plugin;
  }

  private get settings() {
    return this.plugin.settings;
  }
  private get vault() {
    return this.plugin.app.vault;
  }

  // Get Folder from Folder Note

  /**
   * Get path of given note/notePath's folder based on setting
   * @param note notePath or note TFile
   * @param newFolder if the path is used to create new folder
   * @returns folder path
   */
  getFolderPath = (note: TFile | string, newFolder = false): string => {
    const { parent, base } = getFileInfo(note);
    const getSiblingFolder = () => {
      if (parent === "/") return base;
      else return join(parent, base);
    };
    switch (this.settings.folderNotePref) {
      case NoteLoc.Index:
      case NoteLoc.Inside:
        if (newFolder) return getSiblingFolder();
        else return parent;
      case NoteLoc.Outside:
        return getSiblingFolder();
      default:
        assertNever(this.settings.folderNotePref);
    }
  };

  createFolderForNote = async (file: TFile) => {
    const newFolderPath = this.getFolderPath(file, true);
    // @ts-ignore
    const folderExist: boolean = await this.vault.exists(newFolderPath);
    if (folderExist) {
      new Notice("Folder already exists");
      return;
    }
    await this.vault.createFolder(newFolderPath);
    let newNotePath: string | null;
    switch (this.settings.folderNotePref) {
      case NoteLoc.Index:
        newNotePath = join(newFolderPath, this.settings.indexName + ".md");
        break;
      case NoteLoc.Inside:
        newNotePath = join(newFolderPath, file.name);
        break;
      case NoteLoc.Outside:
        newNotePath = null;
        break;
      default:
        assertNever(this.settings.folderNotePref);
    }
    if (newNotePath) this.vault.rename(file, newNotePath);
  };

  getFolderFromNote = (note: TFile | string): TFolder | null => {
    if (!isMd(note)) return null;
    const { parent, base } = getFileInfo(note);
    // check if folder note name vaild
    switch (this.settings.folderNotePref) {
      case NoteLoc.Index:
        if (base !== this.settings.indexName) return null;
        break;
      case NoteLoc.Inside:
        if (base !== basename(parent)) return null;
        break;
      case NoteLoc.Outside:
        break;
      default:
        assertNever(this.settings.folderNotePref);
    }
    const path = this.getFolderPath(note);
    if (path)
      return (this.vault.getAbstractFileByPath(path) as TFolder) ?? null;
    else return null;
  };

  // Get Folder Note from Folder

  getFolderNote = (
    ...args: Parameters<NoteFinder["getFolderNotePath"]>
  ): TFile | null => {
    const result = this.getFolderNotePath(...args).info;
    return this.findFolderNote(...result);
  };

  findFolderNote = (findIn: string, noteBaseName: string): TFile | null => {
    const findInFolder = this.vault.getAbstractFileByPath(findIn);
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

  getFolderNotePath = (
    ...args: [path: string, folder: TFolder] | [folder: TFolder]
  ): folderNotePath => {
    const [src, baseFolder] = args;
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
    const { indexName, folderNotePref: folderNoteLoc } = this.settings;
    let findIn: string, noteBaseName: string;

    switch (folderNoteLoc) {
      case NoteLoc.Index:
        noteBaseName = indexName;
        break;
      case NoteLoc.Inside:
      case NoteLoc.Outside:
        if (typeof src === "string") noteBaseName = parse(src).name;
        else noteBaseName = src.name === "/" ? this.vault.getName() : src.name;
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
    return {
      info: [findIn, noteBaseName],
      path: join(findIn, noteBaseName + ".md"),
    };
  };
}
