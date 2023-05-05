import "./main.less";

import type { FolderNoteAPI } from "@aidenlx/folder-note-core";
import { getApi as getFNCApi } from "@aidenlx/folder-note-core";
import { getApi as getISCApi } from "@aidenlx/obsidian-icon-shortcodes";
import { Notice, Plugin } from "obsidian";

import PatchDragManager from "./drag-patch";
import PatchFileExplorer from "./fe-patch";
import { ClickNotice } from "./misc";
import registerSetFolderIconCmd from "./modules/set-folder-icon";
import type { ALxFolderNoteSettings } from "./settings";
import {
  ALxFolderNoteSettingTab,
  DEFAULT_SETTINGS,
  MobileNoClickMark,
  noHideNoteMark,
} from "./settings";

const foldervNotifiedKey = "foldervNotified";

export default class ALxFolderNote extends Plugin {
  settings: ALxFolderNoteSettings = DEFAULT_SETTINGS;

  get CoreApi(): FolderNoteAPI {
    let message;
    const api = getFNCApi(this) || getFNCApi();
    if (api) {
      return api;
    } else {
      message = "Failed to initialize alx-folder-note";
      new ClickNotice(message + ": Click here for more details", () =>
        this.app.setting.openTabById(this.manifest.id),
      );
      throw new Error(message + ": folder-note-core not available");
    }
  }
  get IconSCAPI() {
    if (this.settings.folderIcon) {
      return getISCApi(this);
    }
    return null;
  }

  noticeFoldervChange() {
    if (
      !this.app.plugins.plugins["alx-folder-note-folderv"] && // not installed
      !Number(localStorage.getItem(foldervNotifiedKey)) // not notified
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
            text: "Don't show this again",
          });
        },
        () => localStorage.setItem(foldervNotifiedKey, "1"),
        5e3,
      );
    }
  }

  initialized = false;
  initialize() {
    if (this.initialized) return;
    PatchFileExplorer(this);
    document.body.toggleClass(
      MobileNoClickMark,
      !this.settings.mobileClickToOpen,
    );
    document.body.toggleClass(
      noHideNoteMark,
      !this.settings.hideNoteInExplorer,
    );
    this.initialized = true;
  }

  async onload() {
    console.log("loading alx-folder-note");

    await this.loadSettings();

    const tab = new ALxFolderNoteSettingTab(this.app, this);
    if (!tab.checkMigrated())
      new Notice(
        "Old config not yet migrated, \n" +
          "Open Settings Tab of ALx Folder Note for details",
      );
    this.addSettingTab(tab);

    let initCalled = false;
    const init = () => {
      initCalled = true;
      registerSetFolderIconCmd(this);
      this.app.workspace.onLayoutReady(this.initialize.bind(this));
      PatchDragManager(this);
      this.noticeFoldervChange();
    };

    if (getFNCApi(this)) {
      init();
    } else {
      if (this.app.plugins.enabledPlugins.has("folder-note-core")) {
        const timeoutId = window.setTimeout(() => {
          if (!initCalled) {
            this.app.vault.offref(evtRef);
            throw new Error(
              "folder-note-core enabled but fail to load within 5s",
            );
          }
        }, 5e3);
        const evtRef = this.app.vault.on("folder-note:api-ready", () => {
          init();
          if (timeoutId) window.clearTimeout(timeoutId);
          this.app.vault.offref(evtRef); // register event only once
        });
      } else {
        this.CoreApi; // prompt to enable folder-note-core
      }
    }
  }

  async loadSettings() {
    this.settings = { ...this.settings, ...(await this.loadData()) };
    this.setupLongPressDelay();
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  get longPressDelay(): number {
    return this.settings.longPressDelay;
  }
  set longPressDelay(delay: number) {
    this.settings.longPressDelay = delay;
    document.body.dataset[longPressDelayDataKey] = `${delay}`;
  }
  setupLongPressDelay() {
    // set long press delay to the body
    this.longPressDelay = this.longPressDelay;
    this.register(() => delete document.body.dataset[longPressDelayDataKey]);
  }
}

const longPressDelayDataKey = "longPressDelay";
