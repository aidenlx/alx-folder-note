import { isModifier } from "misc";
import { NoteHandler } from "note-handler";
import {
  AFItem,
  FileExplorer,
  FolderItem,
  Plugin,
  TFile,
  TFolder,
} from "obsidian";
import path from "path";
import {
  ALxFolderNoteSettings,
  DEFAULT_SETTINGS,
  ALxFolderNoteSettingTab,
  NoteLoc,
} from "settings";
import "./main.css";

type afItemMark = AFItem & { evtDone?: true; isFolderNote?: true };

const isFolder = (item: AFItem): item is FolderItem =>
  (item as FolderItem).file instanceof TFolder;

export default class ALxFolderNote extends Plugin {
  settings: ALxFolderNoteSettings = DEFAULT_SETTINGS;
  fileExplorer?: FileExplorer;
  handler = new NoteHandler(this);

  setupClick = (afItem: AFItem) => {
    const item = afItem as afItemMark;
    if (isFolder(item) && !item.evtDone) {
      const { titleInnerEl } = item;
      // handle regular click
      this.registerDomEvent(titleInnerEl, "click", this.clickHandler);
      // handle middle click
      this.registerDomEvent(titleInnerEl, "auxclick", this.clickHandler);
      item.evtDone = true;
    }
  };

  setupHide = (
    folderNoteFile: TFile,
    list: FileExplorer["fileItems"],
    revert = false,
  ) => {
    if (!folderNoteFile) return;
    const folderNote = list[folderNoteFile.path] as afItemMark;
    if (!revert && !folderNote.isFolderNote) {
      folderNote.titleEl.style.display = "none";
      folderNote.isFolderNote = true;
      // item.isFolderNote = true;
    } else if (revert && folderNote.isFolderNote) {
      folderNote.titleEl.style.display = "";
      folderNote.isFolderNote = undefined;
      // item.isFolderNote = undefined;
    }
  };

  getFolderNote(path: string, folder: TFolder): TFile | null;
  getFolderNote(folder: TFolder): TFile | null;
  getFolderNote(src: TFolder | string, baseFolder?: TFolder): TFile | null {
    // @ts-ignore
    const result = this.handler.getAbstractFolderNote(src, baseFolder);
    return this.handler.findFolderNote(result.findIn, result.noteBaseName);
  }

  clickHandler = (evt: MouseEvent) => {
    const titleInnerEl = evt.target as HTMLDivElement;
    const titleEl = titleInnerEl.parentElement as HTMLDivElement;
    const navFolder = titleEl?.parentElement as HTMLDivElement;

    const tryOpen = async (): Promise<boolean> => {
      try {
        if (!this.fileExplorer) throw new Error("fileExplorer Missing");
        if (!titleEl || !navFolder) {
          console.error("unable to get parents for", titleInnerEl);
          return false;
        }
        if (titleInnerEl.hasClass("is-being-renamed")) return false;
        if (evt.type === "auxclick" && evt.button !== 1) return false;

        evt.stopPropagation();
        // get the folder path
        if (!this.fileExplorer.files.has(navFolder)) {
          console.error("folder not found for el: ", navFolder);
          return false;
        }
        const folder = this.fileExplorer.files.get(navFolder) as TFolder;
        const createNew = isModifier(evt, this.settings.modifierForNewNote);

        // check if folder note exists
        const { findIn, noteBaseName } =
          this.handler.getAbstractFolderNote(folder);
        let folderNote = this.handler.findFolderNote(findIn, noteBaseName);
        if (createNew && !folderNote) {
          const noteInitContent = "# " + noteBaseName; //await this.handler.expandContent(this.initContent);
          folderNote = await this.app.vault.create(
            path.join(findIn.path, noteBaseName + ".md"),
            noteInitContent,
          );
        }

        if (!folderNote) return false;

        // show the note
        await this.app.workspace.openLinkText(folderNote.path, "", createNew, {
          active: true,
        });
        return true;
      } catch (error) {
        return false;
      }
    };
    tryOpen()
      .then((success) => {
        if (!success && evt.type === "click") titleEl.click();
      })
      .catch((e) => {
        console.error(e);
        if (evt.type === "click") titleEl.click();
      });
  };

  registerVaultEvent = () => {
    // attach events on new folder
    this.registerEvent(
      this.app.vault.on("create", (af) => {
        if (!(af instanceof TFolder)) return;
        if (!this.fileExplorer) {
          console.error("no fileExplorer");
          return;
        }
        const afItem = this.fileExplorer.fileItems[af.path] as afItemMark;
        this.setupClick(afItem);
      }),
    );
    // include mv and rename
    this.registerEvent(
      this.app.vault.on("rename", (af, oldPath) => {
        if (af instanceof TFolder) {
          if (!this.fileExplorer) {
            console.error("no fileExplorer");
            return;
          }
          const fileExplorer = this.fileExplorer;
          this.setupClick(fileExplorer.fileItems[af.path]);
          // show old note
          const oldNote = this.getFolderNote(oldPath, af);
          if (oldNote) this.setupHide(oldNote, fileExplorer.fileItems, true);
          // hide new note
          const newNote = this.getFolderNote(af);
          if (newNote) this.setupHide(newNote, fileExplorer.fileItems);
          // sync
          if (this.settings.autoRename && !newNote && oldNote) {
            const { findIn, noteBaseName } =
              this.handler.getAbstractFolderNote(af);
            this.app.vault.rename(
              oldNote,
              path.join(findIn.path, noteBaseName + ".md"),
            );
            this.setupHide(oldNote, fileExplorer.fileItems);
          }
        }
      }),
    );
    this.registerEvent(
      this.app.vault.on("delete", (af) => {
        if (
          af instanceof TFolder &&
          this.settings.folderNotePref === NoteLoc.Outside
        ) {
          if (!this.fileExplorer) {
            console.error("no fileExplorer");
            return;
          }
          const oldNote = this.getFolderNote(af);
          if (oldNote)
            this.setupHide(oldNote, this.fileExplorer.fileItems, true);
        }
      }),
    );
  };

  async onload() {
    console.log("loading alx-folder-note");

    await this.loadSettings();

    this.addSettingTab(new ALxFolderNoteSettingTab(this.app, this));

    this.registerEvent(
      this.app.workspace.on("layout-ready", () => {
        const leaves = this.app.workspace.getLeavesOfType("file-explorer");
        if (leaves.length > 1) console.error("more then one file-explorer");
        else if (leaves.length < 1) console.error("file-explorer not found");
        else {
          const fileExplorer =
            this.fileExplorer ?? (leaves[0].view as FileExplorer);
          console.log("in file-explorer");
          this.fileExplorer = fileExplorer;
          this.registerVaultEvent();
          // get all AbstractFile (file+folder) and attach event
          for (const key in fileExplorer.fileItems) {
            if (
              !Object.prototype.hasOwnProperty.call(fileExplorer.fileItems, key)
            )
              continue;
            const item = fileExplorer.fileItems[key];
            if (isFolder(item)) {
              this.setupClick(item);
              const note = this.getFolderNote(item.file);
              if (note) this.setupHide(note, fileExplorer.fileItems);
            }
          }
        }
      }),
    );
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
