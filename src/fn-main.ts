import "./styles/main.css";

import { FolderNoteAPI, getApi } from "@aidenlx/folder-note-core";
import { debounce, Debouncer, Notice, Plugin } from "obsidian";

import initialize from "./initialize";
import { ClickNotice } from "./misc";
import FEHandler from "./modules/fe-handler";
import {
  ALxFolderNoteSettings,
  ALxFolderNoteSettingTab,
  DEFAULT_SETTINGS,
} from "./settings";

const foldervNotifiedKey = "foldervNotified";

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
    const api = getApi(this);
    if (api) {
      return api;
    } else {
      message =
        "Failed to initialize alx-folder-note: Click here for more details";
      new ClickNotice(message, () =>
        this.app.setting.openTabById(this.manifest.id),
      );
      throw new Error(message);
    }
  }

  noticeFoldervChange() {
    if (
      !this.app.plugins.plugins["alx-folder-note-folderv"] ||
      !Number(localStorage.getItem(foldervNotifiedKey))
    ) {
      new ClickNotice(
        (frag) => {
          frag.appendText(
            "Since v0.13.0, folder overview (folderv) has become an optional component " +
              "that requires a dedicated plugin, ",
          );
          frag
            .createEl("button", {
              text: "Go to Folder Overview Section of the Setting Tab to Install",
            })
            .addEventListener("click", () =>
              this.app.setting.openTabById(this.manifest.id),
            );
          frag.createEl("button", {
            text: "Ignore",
          });
        },
        () => localStorage.setItem(foldervNotifiedKey, "1"),
        5e3,
      );
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
    this.noticeFoldervChange();
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
