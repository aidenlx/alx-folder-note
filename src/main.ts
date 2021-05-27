import { FileExplorer, Plugin } from "obsidian";
import {
  ALxFolderNoteSettings,
  DEFAULT_SETTINGS,
  ALxFolderNoteSettingTab,
} from "settings";
import "./main.css";

export default class ALxFolderNote extends Plugin {
  settings: ALxFolderNoteSettings = DEFAULT_SETTINGS;
  fileExplorer?: FileExplorer;

  async onload() {
    console.log("loading alx-folder-note");

    await this.loadSettings();

    this.addSettingTab(new ALxFolderNoteSettingTab(this.app, this));
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
