import { initialize } from "note-handler";
import {
  getAbstractFolderNote,
  findFolderNote,
  getFolderPath,
} from "modules/find";
import {
  FileExplorer,
  MarkdownView,
  Notice,
  Plugin,
  TFile,
  TFolder,
} from "obsidian";
import {
  ALxFolderNoteSettings,
  DEFAULT_SETTINGS,
  ALxFolderNoteSettingTab,
} from "settings";
import "./styles/main.css";
import { onCreate, onDelete, onRename } from "modules/vault-handler";
import { NoteLoc } from "misc";
import { join } from "path";
import assertNever from "assert-never";

export default class ALxFolderNote extends Plugin {
  settings: ALxFolderNoteSettings = DEFAULT_SETTINGS;
  fileExplorer?: FileExplorer;

  initialize = (revert = false) => initialize(this, revert);

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

    this.addCommand({
      id: "create-folder-for-note",
      name: "Make current document folder note",
      checkCallback: (checking) => {
        const view = this.app.workspace.activeLeaf.view as MarkdownView;
        if (checking) {
          return view instanceof MarkdownView;
        } else {
          this.createFolderForNote(view.file);
        }
      },
      hotkeys: [],
    });

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
