import ALxFolderNote from "fn-main";
import { getRenamedPath, isMd, NoteLoc } from "misc";
import FEHandler from "modules/fe-handler";
import {
  FileManager,
  Notice,
  TAbstractFile,
  TFile,
  TFolder,
  Vault,
} from "obsidian";
import { basename, dirname } from "path-browserify";

export default class VaultHandler {
  // @ts-ignore
  private on: Vault["on"] = (...args) => this.plugin.app.vault.on(...args);
  private delete: Vault["delete"] = (...args) =>
    this.plugin.app.vault.delete(...args);
  private rename: FileManager["renameFile"] = (...args) =>
    this.plugin.app.fileManager.renameFile(...args);

  private get feHandler(): FEHandler {
    if (this.plugin.feHandler) return this.plugin.feHandler;
    else throw new Error("Missing feHandler");
  }
  private get settings() {
    return this.plugin.settings;
  }
  private get finder() {
    return this.plugin.finder;
  }
  plugin: ALxFolderNote;

  constructor(plugin: ALxFolderNote) {
    this.plugin = plugin;
  }

  registerEvent = () => {
    this.plugin.registerEvent(this.on("create", this.onChange));
    this.plugin.registerEvent(this.on("rename", this.onChange));
    this.plugin.registerEvent(this.on("delete", this.onDelete));
  };

  private shouldRename(af: TAbstractFile, oldPath?: string): boolean {
    const renameOnly =
      oldPath &&
      this.settings.autoRename &&
      this.settings.folderNotePref !== NoteLoc.Index &&
      dirname(af.path) === dirname(oldPath) // rename only, same loc
        ? true
        : false;
    // sync loc is enabled in folder renames only
    const syncLoc =
      af instanceof TFolder &&
      oldPath &&
      this.settings.autoRename &&
      this.settings.folderNotePref === NoteLoc.Outside &&
      dirname(af.path) !== dirname(oldPath)
        ? true
        : false;
    return renameOnly || syncLoc;
  }

  onChange = (af: TAbstractFile, oldPath?: string) => {
    const { getFolderNote, getFolderFromNote, getFolderNotePath } = this.finder;
    if (!this.feHandler) {
      console.error("no fileExplorer");
      return;
    }

    function getOldLinked(af: TFile): TFolder | null;
    function getOldLinked(af: TFolder): TFile | null;
    function getOldLinked(af: TAbstractFile): TFile | TFolder | null;
    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    function getOldLinked(af: TAbstractFile): TFile | TFolder | null {
      if (af instanceof TFolder) {
        return oldPath ? getFolderNote(oldPath, af) : null;
      } else if (af instanceof TFile) {
        return oldPath && isMd(oldPath) ? getFolderFromNote(oldPath) : null;
      } else return null;
    }

    // markdown <-> non-md
    if (oldPath && af instanceof TFile && isMd(oldPath) !== isMd(af)) {
      const oldLinked = getOldLinked(af);
      if (oldLinked) {
        // folder note -> non-md
        this.feHandler.setMark(oldLinked, true);
        this.feHandler.setMark(af, true);
      } else {
        // non-md -> md, check if folder note
        this.feHandler.markFolderNote(af);
      }
    } else {
      if (af instanceof TFolder) this.feHandler.setClick(af);
      // check if new location contains matched folder and mark if exists
      const newExists = this.feHandler.markFolderNote(af);

      // onRename, check if oldPath has any folder note/linked folder
      const oldLinked = getOldLinked(af);
      if (!oldLinked) return;

      const renameTo =
        af instanceof TFolder
          ? getFolderNotePath(af).path
          : af instanceof TFile
          ? getRenamedPath(oldLinked, af.basename)
          : "";

      if (this.shouldRename(af, oldPath))
        if (!newExists) {
          this.rename(oldLinked, renameTo);
          return;
        } else {
          const target =
            oldLinked instanceof TFile ? "folder note" : "linked folder";
          new Notice(
            `Failed to sync name of ${target}: ` +
              `${target} ${basename(renameTo)} already exists`,
          );
        }

      // reset old linked folder note/folder mark when no rename is performed
      this.feHandler.setMark(oldLinked, true);
    }
  };
  onDelete = (af: TAbstractFile) => {
    const { getFolderNote, getFolderFromNote } = this.finder;
    if (af instanceof TFolder) {
      const oldNote = getFolderNote(af);
      if (!(this.settings.folderNotePref === NoteLoc.Outside && oldNote))
        return;

      if (this.settings.deleteOutsideNoteWithFolder) {
        this.delete(oldNote);
      } else this.feHandler.setMark(oldNote, true);
    } else if (af instanceof TFile && isMd(af)) {
      const oldFolder = getFolderFromNote(af);
      if (oldFolder) this.feHandler.setMark(oldFolder, true);
    }
  };
}
