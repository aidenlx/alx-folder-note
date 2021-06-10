import "./styles/main.css";

import assertNever from "assert-never";
import { isFolder, iterateItems, NoteLoc } from "misc";
import {
  AddOptionsForFolder,
  AddOptionsForNote,
  PatchRevealInExplorer,
} from "modules/commands";
import { getFolderPath } from "modules/find";
import { VaultHandler } from "modules/vault-handler";
import { hideAll, setupClick } from "note-handler";
import { AFItem, FileExplorer, Notice, Plugin, TFile, TFolder } from "obsidian";
import { join } from "path-browserify";
import {
  ALxFolderNoteSettings,
  ALxFolderNoteSettingTab,
  DEFAULT_SETTINGS,
} from "settings";

export default class ALxFolderNote extends Plugin {
  settings: ALxFolderNoteSettings = DEFAULT_SETTINGS;
  fileExplorer?: FileExplorer;

  initialize = (revert = false) => {
    PatchRevealInExplorer(this);
    const leaves = this.app.workspace.getLeavesOfType("file-explorer");
    if (leaves.length > 1) console.error("more then one file-explorer");
    else if (leaves.length < 1) console.error("file-explorer not found");
    else {
      const fileExplorer =
        this.fileExplorer ?? (leaves[0].view as FileExplorer);
      this.fileExplorer = fileExplorer;
      if (!revert) this.vaultHandler.registerEvent();
      // get all AbstractFile (file+folder) and attach event
      iterateItems(fileExplorer.fileItems, (item: AFItem) => {
        if (isFolder(item)) {
          setupClick(item, this, revert);
        }
      });
      if (this.settings.hideNoteInExplorer) hideAll(this, revert);
    }
  };

  vaultHandler = new VaultHandler(this);

  getNewFolderNote = (folder: TFolder): string =>
    this.settings.folderNoteTemplate
      .replace(/{{FOLDER_NAME}}/g, folder.name)
      .replace(/{{FOLDER_PATH}}/g, folder.path);

  async onload() {
    console.log("loading alx-folder-note");

    await this.loadSettings();

    this.addSettingTab(new ALxFolderNoteSettingTab(this.app, this));

    AddOptionsForNote(this);
    AddOptionsForFolder(this);
    this.app.workspace.onLayoutReady(this.initialize);
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
  async createFolderForNote(file: TFile) {
    const newFolderPath = getFolderPath(this, file, true);
    const folderExist = await this.app.vault.adapter.exists(newFolderPath);
    if (folderExist) {
      new Notice("Folder already exists");
      return;
    }
    await this.app.vault.createFolder(newFolderPath);
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
    if (newNotePath) this.app.vault.rename(file, newNotePath);
  }
}
