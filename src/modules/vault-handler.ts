import ALxFolderNote from "main";
import { afItemMark, getRenamedPath, isMd, NoteLoc } from "misc";
import FEHandler from "modules/fe-handler";
import {
  debounce,
  Notice,
  TAbstractFile,
  TFile,
  TFolder,
  Vault,
} from "obsidian";
import { dirname, extname } from "path-browserify";

type warp<Func extends (...args: any) => any> = (
  ...args: Parameters<Func>
) => void;

export default class VaultHandler {
  private get vault() {
    return this.plugin.app.vault;
  }
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
    this.plugin.registerEvent(this.vault.on("create", this.onCreate));
    this.plugin.registerEvent(this.vault.on("rename", this.onRename));
    this.plugin.registerEvent(this.vault.on("delete", this.onDelete));
  };

  onCreate = (af: TAbstractFile) => {
    if (!this.feHandler) {
      console.error("no fileExplorer");
      return;
    }
    if (af instanceof TFolder) {
      const afItem = this.feHandler.getAfItem(af.path);
      if (!afItem) {
        console.error("no afitem found for filepath", af.path);
        return;
      }
      this.feHandler.setClick(afItem);
      this.feHandler.markFolderNote(af);
    } else if (af instanceof TFile) {
      this.feHandler.markFolderNote(af);
    }
  };
  onRename = (af: TAbstractFile, oldPath: string) => {
    const { getFolderNote, getFolderFromNote, getFolderNotePath } = this.finder;

    if (af instanceof TFolder) {
      this.feHandler.setClick(af.path);
      const oldNote = getFolderNote(oldPath, af);
      const newNote = getFolderNote(af);
      // update folder mark
      this.feHandler.setMark(af, !newNote);
      // show old note
      if (oldNote) this.feHandler.setMark(oldNote, true);
      // hide new note
      if (newNote) {
        this.feHandler.setMark(newNote);
      }
      // sync note name with folder
      if (
        this.settings.autoRename &&
        this.settings.folderNotePref !== NoteLoc.Index &&
        !newNote &&
        oldNote
      ) {
        const { path } = getFolderNotePath(af);
        this.vault.rename(oldNote, path);
        this.feHandler.setMark(oldNote);
      }
    } else if (af instanceof TFile) {
      const oldFolder = getFolderFromNote(oldPath);
      if (isMd(oldPath) && isMd(af)) {
        // sync folder name with note
        if (
          this.settings.folderNotePref !== NoteLoc.Index &&
          this.settings.autoRename &&
          oldFolder &&
          dirname(af.path) === dirname(oldPath)
        ) {
          // rename only
          this.vault.rename(oldFolder, getRenamedPath(oldFolder, af.basename));
        } else {
          if (oldFolder) this.feHandler.setMark(oldFolder, true);
          // check if new location contains matched folder
          this.feHandler.markFolderNote(af);
        }
      } else if (isMd(oldPath) !== isMd(af)) {
        if (isMd(oldPath)) {
          const oldFolder = getFolderFromNote(oldPath);
          if (oldFolder) this.feHandler.setMark(oldFolder, true);
        } else {
          this.feHandler.markFolderNote(af);
        }
      }
    }
  };
  onDelete = (af: TAbstractFile) => {
    const { getFolderNote, getFolderFromNote } = this.finder;
    if (af instanceof TFolder) {
      let oldNote: TFile | null;
      if (
        this.settings.folderNotePref === NoteLoc.Outside &&
        (oldNote = getFolderNote(af))
      )
        if (this.settings.deleteOutsideNoteWithFolder) {
          this.vault.delete(oldNote);
          new Notice(`Folder note ${oldNote.basename} deleted`);
        } else this.feHandler.setMark(oldNote, true);
    } else if (af instanceof TFile) {
      const oldFolder = getFolderFromNote(af);
      if (oldFolder) this.feHandler.setMark(oldFolder, true);
    }
  };
}
