import "./styles/main.css";

import {
  App,
  debounce,
  Debouncer,
  Notice,
  Plugin,
  PluginManifest,
  TFolder,
} from "obsidian";

import { FOLDERV_ID, GetFolderVHandler } from "./components/load";
import initialize from "./initialize";
import { AddOptionsForFolder, AddOptionsForNote } from "./modules/commands";
import FEHandler from "./modules/fe-handler";
import NoteFinder from "./modules/find";
import VaultHandler from "./modules/vault-handler";
import {
  ALxFolderNoteSettings,
  ALxFolderNoteSettingTab,
  DEFAULT_SETTINGS,
} from "./settings";
import API from "./typings/api";
export default class ALxFolderNote extends Plugin {
  settings: ALxFolderNoteSettings = DEFAULT_SETTINGS;
  feHandler?: FEHandler;
  vaultHandler = new VaultHandler(this);
  finder: NoteFinder;
  api: API;
  initialize = initialize.bind(this);

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest);
    let finder = new NoteFinder(this);
    this.finder = finder;
    this.api = {
      get getFolderFromNote() {
        return finder.getFolderFromNote;
      },
      get getFolderNote() {
        return finder.getFolderNote;
      },
    };
  }

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

  async onload() {
    console.log("loading alx-folder-note");

    await this.loadSettings();

    this.addSettingTab(new ALxFolderNoteSettingTab(this.app, this));

    AddOptionsForNote(this);
    AddOptionsForFolder(this);
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

  getNewFolderNote = (folder: TFolder): string =>
    this.settings.folderNoteTemplate
      .replace(/{{FOLDER_NAME}}/g, folder.name)
      .replace(/{{FOLDER_PATH}}/g, folder.path);
}
