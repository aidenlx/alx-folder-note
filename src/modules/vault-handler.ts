import ALxFolderNote from "main";
import { afItemMark, NoteLoc } from "misc";
import {
  debounce,
  Notice,
  TAbstractFile,
  TFile,
  TFolder,
  Vault,
} from "obsidian";
import { dirname, join, extname } from "path-browserify";
import { setupClick, setupHide } from "../note-handler";
import {
  findFolderFromNote,
  getAbstractFolderNote,
  getParentPath,
  getFolderNote,
} from "./find";
export class VaultHandler {
  get app() {
    return this.plugin.app;
  }
  get vault() {
    return this.plugin.app.vault;
  }
  get fileExplorer() {
    return this.plugin.fileExplorer;
  }
  get settings() {
    return this.plugin.settings;
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
  private setupClick = (afItem: Parameters<typeof setupClick>[0]) => {
    this.do(() => setupClick(afItem, this.plugin));
  };
  private setupHide = (...args: Parameters<typeof setupHide>) => {
    this.do(() => setupHide(...args));
  };
  private fileRename = (...args: Parameters<Vault["rename"]>) => {
    this.do(() => this.vault.rename(...args));
  };
  private fileDelete = (...args: Parameters<Vault["delete"]>) => {
    this.do(() => this.vault.delete(...args));
  };

  onCreate = (af: TAbstractFile) => {
    if (!this.fileExplorer) {
      console.error("no fileExplorer");
      return;
    }
    const fileExplorer = this.fileExplorer;
    if (af instanceof TFolder) {
      const afItem = fileExplorer.fileItems[af.path] as afItemMark;
      this.setupClick(afItem);
      const note = getFolderNote(this.plugin, af);
      if (note && this.settings.hideNoteInExplorer) {
        this.setupHide(note, fileExplorer.fileItems);
      }
    } else if (
      af instanceof TFile &&
      findFolderFromNote(this.plugin, af) &&
      this.settings.hideNoteInExplorer
    ) {
      this.setupHide(af, fileExplorer.fileItems);
    }
  };
  onRename = (af: TAbstractFile, oldPath: string) => {
    if (!this.fileExplorer) {
      console.error("no fileExplorer");
      return;
    }
    const fileExplorer = this.fileExplorer;
    if (af instanceof TFolder) {
      this.setupClick(fileExplorer.fileItems[af.path]);
      const oldNote = getFolderNote(this.plugin, oldPath, af);
      const newNote = getFolderNote(this.plugin, af);
      if (this.settings.hideNoteInExplorer) {
        // show old note
        if (oldNote) this.setupHide(oldNote, fileExplorer.fileItems, true);
        // hide new note
        if (newNote) this.setupHide(newNote, fileExplorer.fileItems);
      }
      // sync
      if (
        this.settings.autoRename &&
        this.settings.folderNotePref !== NoteLoc.Index &&
        !newNote &&
        oldNote
      ) {
        const { findIn, noteBaseName } = getAbstractFolderNote(this.plugin, af);
        this.fileRename(oldNote, join(findIn, noteBaseName + ".md"));
        if (this.settings.hideNoteInExplorer)
          this.setupHide(oldNote, fileExplorer.fileItems);
      }
    } else if (af instanceof TFile) {
      let oldFolder;
      if (
        extname(oldPath) === ".md" &&
        this.settings.folderNotePref !== NoteLoc.Index &&
        this.settings.autoRename &&
        (oldFolder = findFolderFromNote(this.plugin, oldPath)) &&
        dirname(af.path) === dirname(oldPath)
      ) {
        // rename only
        this.fileRename(
          oldFolder,
          join(getParentPath(oldFolder.path), af.basename),
        );
      } else if (af.extension === "md") {
        // check if new location contains matched folder
        const newFolder = findFolderFromNote(this.plugin, af);
        if (this.settings.hideNoteInExplorer)
          this.setupHide(af, this.fileExplorer.fileItems, !Boolean(newFolder));
      }
    }
  };
  onDelete = (af: TAbstractFile) => {
    if (af instanceof TFolder) {
      let oldNote: TFile | null;
      if (
        this.settings.hideNoteInExplorer &&
        this.settings.folderNotePref === NoteLoc.Outside &&
        (oldNote = getFolderNote(this.plugin, af))
      )
        if (this.fileExplorer) {
          if (this.settings.deleteOutsideNoteWithFolder) {
            this.fileDelete(oldNote);
            new Notice(`Folder note ${oldNote.basename} deleted`);
          } else this.setupHide(oldNote, this.fileExplorer.fileItems, true);
        } else console.error("missing fileExplorer");
    }
  };
}
