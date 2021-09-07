import "./styles/main.css";

import {
  FolderNoteAPI,
  getApi,
  isPluginEnabled,
} from "@aidenlx/folder-note-core";
import { debounce, Debouncer, Notice, Plugin } from "obsidian";

import { FOLDERV_ID, GetFolderVHandler } from "./components/load";
import initialize from "./initialize";
import FEHandler from "./modules/fe-handler";
import {
  ALxFolderNoteSettings,
  ALxFolderNoteSettingTab,
  DEFAULT_SETTINGS,
} from "./settings";

export default class ALxFolderNote extends Plugin {
  settings: ALxFolderNoteSettings = DEFAULT_SETTINGS;
  feHandler?: FEHandler;
  initialize = initialize.bind(this);

  private _notify = (
    id: string,
    message: string | null,
    timeout?: number | undefined,
  ): void => {
    if (message) new Notice(message, timeout);
    this._noticeSender.delete(id);
  };
  private _noticeSender = new Map<
    string,
    Debouncer<Parameters<ALxFolderNote["notify"]>>
  >();
  /**
   * @param message set to null to cancel message
   */
  notify = (
    id: string,
    message: string | null,
    timeout?: number | undefined,
  ) => {
    let sender = this._noticeSender.get(id);
    if (sender) sender(id, message, timeout);
    else if (message) {
      const debouncer = debounce(this._notify, 1e3, true);
      this._noticeSender.set(id, debouncer);
      debouncer(id, message, timeout);
    }
  };

  get CoreApi(): FolderNoteAPI {
    let message;
    if (isPluginEnabled(this)) {
      const api = getApi(this);
      if (!api) {
        message = "Error: folder-note-core api not available";
        throw new Error(message);
      } else return api;
    } else {
      message =
        "Failed to initialize alx-folder-note: folder-note-core plugin not enabled";
      new Notice(message);
      throw new Error(message);
    }
  }

  async onload() {
    console.log("loading alx-folder-note");

    await this.loadSettings();

    let tab = new ALxFolderNoteSettingTab(this.app, this);
    if (!tab.checkMigrated())
      new Notice(
        "Old config not yet migrated, \n" +
          "Open Settings Tab of ALx Folder Note for details",
      );
    this.addSettingTab(tab);

    this.app.workspace.onLayoutReady(this.initialize);

    this.registerMarkdownCodeBlockProcessor(
      FOLDERV_ID,
      GetFolderVHandler(this),
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
