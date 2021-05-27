import {
  getAbstractFolderNote,
  findFolderNote,
  clickHandler,
  registerVaultEvent,
  initialize,
} from "note-handler";
import { FileExplorer, Plugin, TFile, TFolder } from "obsidian";
import {
  ALxFolderNoteSettings,
  DEFAULT_SETTINGS,
  ALxFolderNoteSettingTab,
} from "settings";
import "./main.css";

export default class ALxFolderNote extends Plugin {
  settings: ALxFolderNoteSettings = DEFAULT_SETTINGS;
  fileExplorer?: FileExplorer;

  getAbstractFolderNote = getAbstractFolderNote.bind(this);
  clickHandler = clickHandler.bind(this);
  registerVaultEvent = registerVaultEvent.bind(this);
  initialize = initialize.bind(this);

  getFolderNote(path: string, folder: TFolder): TFile | null;
  getFolderNote(folder: TFolder): TFile | null;
  getFolderNote(src: TFolder | string, baseFolder?: TFolder): TFile | null {
    // @ts-ignore
    const result = this.getAbstractFolderNote(src, baseFolder);
    return findFolderNote(result.findIn, result.noteBaseName);
  }

  async onload() {
    console.log("loading alx-folder-note");

    await this.loadSettings();

    this.addSettingTab(new ALxFolderNoteSettingTab(this.app, this));

    this.registerEvent(this.app.workspace.on("layout-ready", this.initialize));
  }

  onunload() {
    console.log("unloading alx-folder-note");
  }

  async loadSettings() {
    this.settings = { ...this.settings, ...(await this.loadData()) };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
