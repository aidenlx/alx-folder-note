import ALxFolderNote from "main";
import { afItemMark, getRenamedPath, NoteLoc } from "misc";
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

export default class VaultHandler {
  private get app() {
    return this.plugin.app;
  }
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

  update = debounce(
    () => {
      this.waitingList.forEach((action) => action());
      this.waitingList.length = 0;
    },
    200,
    true,
  );

  registerEvent = () => {
    this.plugin.registerEvent(this.vault.on("create", this.onCreate));
    this.plugin.registerEvent(this.vault.on("rename", this.onRename));
    this.plugin.registerEvent(this.vault.on("delete", this.onDelete));
  };

  private do = (action: () => void) => {
    this.waitingList.push(action);
    this.update();
  };

  waitingList: Function[] = [];
  private setClickForAfItem = (
    ...args: Parameters<FEHandler["setClickForAfItem"]>
  ) => {
    this.do(() => this.feHandler.setClickForAfItem(...args));
  };
  private setupHide = (...args: Parameters<FEHandler["setupHide"]>) => {
    this.do(() => this.feHandler.setupHide(...args));
  };
  private fileRename = (...args: Parameters<Vault["rename"]>) => {
    this.do(() => this.vault.rename(...args));
  };
  private fileDelete = (...args: Parameters<Vault["delete"]>) => {
    this.do(() => this.vault.delete(...args));
  };

  onCreate = (af: TAbstractFile) => {
    if (!this.feHandler) {
      console.error("no fileExplorer");
      return;
    }
    if (af instanceof TFolder) {
      const afItem = this.feHandler.getAfItem(af.path) as afItemMark;
      this.setClickForAfItem(afItem);
      const note = this.finder.getFolderNote(af);
      if (note && this.settings.hideNoteInExplorer) {
        this.setupHide(note);
      }
    } else if (
      af instanceof TFile &&
      this.finder.getFolderFromNote(af) &&
      this.settings.hideNoteInExplorer
    ) {
      this.setupHide(af);
    }
  };
  onRename = (af: TAbstractFile, oldPath: string) => {
    if (af instanceof TFolder) {
      this.setClickForAfItem(af.path);
      const oldNote = this.finder.getFolderNote(oldPath, af);
      const newNote = this.finder.getFolderNote(af);
      if (this.settings.hideNoteInExplorer) {
        // show old note
        if (oldNote) this.setupHide(oldNote, true);
        // hide new note
        if (newNote) this.setupHide(newNote);
      }
      // sync note name with folder
      if (
        this.settings.autoRename &&
        this.settings.folderNotePref !== NoteLoc.Index &&
        !newNote &&
        oldNote
      ) {
        const { path } = this.finder.getFolderNotePath(af);
        this.fileRename(oldNote, path);
        if (this.settings.hideNoteInExplorer) this.setupHide(oldNote);
      }
    } else if (af instanceof TFile) {
      let oldFolder;
      // sync folder name with note
      if (
        extname(oldPath) === ".md" &&
        this.settings.folderNotePref !== NoteLoc.Index &&
        this.settings.autoRename &&
        (oldFolder = this.finder.getFolderFromNote(oldPath)) &&
        dirname(af.path) === dirname(oldPath)
      ) {
        // rename only
        this.fileRename(oldFolder, getRenamedPath(oldFolder, af.basename));
      } else if (af.extension === "md") {
        // check if new location contains matched folder
        const newFolder = this.finder.getFolderFromNote(af);
        if (this.settings.hideNoteInExplorer)
          this.setupHide(af, !Boolean(newFolder));
      }
    }
  };
  onDelete = (af: TAbstractFile) => {
    if (af instanceof TFolder) {
      let oldNote: TFile | null;
      if (
        this.settings.hideNoteInExplorer &&
        this.settings.folderNotePref === NoteLoc.Outside &&
        (oldNote = this.finder.getFolderNote(af))
      )
        if (this.settings.deleteOutsideNoteWithFolder) {
          this.fileDelete(oldNote);
          new Notice(`Folder note ${oldNote.basename} deleted`);
        } else this.setupHide(oldNote, true);
    }
  };
}
