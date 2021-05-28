import { initialize } from "note-handler";
import { getAbstractFolderNote, findFolderNote } from "modules/find";
import { FileExplorer, Plugin, TFile, TFolder } from "obsidian";
import {
  ALxFolderNoteSettings,
  DEFAULT_SETTINGS,
  ALxFolderNoteSettingTab,
} from "settings";
import "./main.css";
import { onCreate, onDelete, onRename } from "modules/vault-handler";

export default class ALxFolderNote extends Plugin {
  settings: ALxFolderNoteSettings = DEFAULT_SETTINGS;
  fileExplorer?: FileExplorer;

  initialize = initialize.bind(this);

  getFolderNote(path: string, folder: TFolder): TFile | null;
  getFolderNote(folder: TFolder): TFile | null;
  getFolderNote(src: TFolder | string, baseFolder?: TFolder): TFile | null {
    const { findIn, noteBaseName } = getAbstractFolderNote(
      this,
      // @ts-ignore
      src,
      baseFolder,
    );
    return findFolderNote(this, findIn, noteBaseName);
  }

  registerVaultEvent() {
    // attach events on new folder
    this.registerEvent(this.app.vault.on("create", onCreate.bind(this)));
    // include mv and rename
    this.registerEvent(this.app.vault.on("rename", onRename.bind(this)));
    this.registerEvent(this.app.vault.on("delete", onDelete.bind(this)));
  }

  async onload() {
    console.log("loading alx-folder-note");

    await this.loadSettings();

    this.addSettingTab(new ALxFolderNoteSettingTab(this.app, this));

    if (this.app.workspace.layoutReady) this.initialize();
    else
      this.registerEvent(
        this.app.workspace.on("layout-ready", this.initialize),
      );
  }

  onunload() {
    console.log("unloading alx-folder-note");
    this.initialize(true);
  }

  async loadSettings() {
    this.settings = { ...this.settings, ...(await this.loadData()) };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
