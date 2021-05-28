import ALxFolderNote from "main";
import { afItemMark, NoteLoc } from "misc";
import { FileExplorer, Modal, TAbstractFile, TFile, TFolder } from "obsidian";
import { dirname, join, extname } from "path";
import { setupClick, setupHide } from "../note-handler";
import {
  findFolderFromNote,
  getAbstractFolderNote,
  getParentPath,
} from "./find";

export function onCreate(this: ALxFolderNote, af: TAbstractFile) {
  if (!this.fileExplorer) {
    console.error("no fileExplorer");
    return;
  }
  const fileExplorer = this.fileExplorer;
  if (af instanceof TFolder) {
    const afItem = fileExplorer.fileItems[af.path] as afItemMark;
    setupClick(afItem, this);
    const note = this.getFolderNote(af);
    if (note && this.settings.hideNoteInExplorer) {
      setupHide(note, fileExplorer.fileItems);
    }
  } else if (
    af instanceof TFile &&
    findFolderFromNote(this, af) &&
    this.settings.hideNoteInExplorer
  ) {
    setupHide(af, fileExplorer.fileItems);
  }
}

export function onRename(
  this: ALxFolderNote,
  af: TAbstractFile,
  oldPath: string,
) {
  if (!this.fileExplorer) {
    console.error("no fileExplorer");
    return;
  }
  const fileExplorer = this.fileExplorer;
  if (af instanceof TFolder) {
    setupClick(fileExplorer.fileItems[af.path], this);
    const oldNote = this.getFolderNote(oldPath, af);
    const newNote = this.getFolderNote(af);
    if (this.settings.hideNoteInExplorer) {
      // show old note
      if (oldNote) setupHide(oldNote, fileExplorer.fileItems, true);
      // hide new note
      if (newNote) setupHide(newNote, fileExplorer.fileItems);
    }
    // sync
    if (
      this.settings.autoRename &&
      this.settings.folderNotePref !== NoteLoc.Index &&
      !newNote &&
      oldNote
    ) {
      const { findIn, noteBaseName } = getAbstractFolderNote(this, af);
      this.app.vault.rename(oldNote, join(findIn, noteBaseName + ".md"));
      if (this.settings.hideNoteInExplorer)
        setupHide(oldNote, fileExplorer.fileItems);
    }
  } else if (af instanceof TFile) {
    let oldFolder;
    if (
      extname(oldPath) === ".md" &&
      this.settings.folderNotePref !== NoteLoc.Index &&
      this.settings.autoRename &&
      (oldFolder = findFolderFromNote(this, oldPath)) &&
      dirname(af.path) === dirname(oldPath)
    ) {
      // rename only
      this.app.vault.rename(
        oldFolder,
        join(getParentPath(oldFolder.path), af.basename),
      );
    } else if (af.extension === "md") {
      // check if new location contains matched folder
      const newFolder = findFolderFromNote(this, af);
      if (this.settings.hideNoteInExplorer)
        setupHide(af, this.fileExplorer.fileItems, !Boolean(newFolder));
    }
  }
}
export function onDelete(this: ALxFolderNote, af: TAbstractFile) {
  if (af instanceof TFolder) {
    let oldNote: TFile | null;
    if (
      this.settings.folderNotePref === NoteLoc.Outside &&
      (oldNote = this.getFolderNote(af))
    )
      new DeleteFolderNotePrompt(this, oldNote).open();
  } else if (af instanceof TFile) {
    const folder = findFolderFromNote(this, af);
    if (folder) {
      new DeleteFolderNotePrompt(this, folder).open();
    }
  }
}

class DeleteFolderNotePrompt extends Modal {
  target: TFile | TFolder;
  plugin: ALxFolderNote;
  constructor(plugin: ALxFolderNote, target: TFile | TFolder) {
    super(plugin.app);
    this.plugin = plugin;
    this.target = target;
  }

  get settings() {
    return this.plugin.settings;
  }
  get fileExplorer(): FileExplorer {
    if (!this.plugin.fileExplorer) {
      throw new Error("no fileExplorer");
    } else return this.plugin.fileExplorer;
  }

  deleteFolder(folder: TFolder) {
    let { contentEl } = this;
    contentEl.createEl("p", {}, (el) => {
      el.innerHTML =
        "Seems like you've deleted a folder note. " +
        "<br/>" +
        "Would you like to delete its folder as well? ";
    });
    contentEl.createEl("p", {
      text: "Warning: the entire folder and its content will be removed",
      cls: "mod-warning",
    });
    const buttonContainer = contentEl.createDiv({
      cls: "modal-button-container",
    });
    buttonContainer.createEl(
      "button",
      { text: "Yes", cls: "mod-warning" },
      (el) =>
        el.onClickEvent(() => {
          this.app.vault.delete(this.target);
          this.close();
        }),
    );
    buttonContainer.createEl("button", { text: "No" }, (el) =>
      el.onClickEvent(() => {
        this.close();
      }),
    );
  }
  deleteFolderNote(file: TFile) {
    let { contentEl } = this;
    contentEl.createEl("p", {}, (el) => {
      el.innerHTML =
        "Seems like you've deleted a folder with folder note outside. " +
        "<br/>" +
        "Would you like to delete folder note outside as well? ";
    });
    const buttonContainer = contentEl.createDiv({
      cls: "modal-button-container",
    });
    buttonContainer.createEl(
      "button",
      { text: "Yes", cls: "mod-warning" },
      (el) =>
        el.onClickEvent(() => {
          this.app.vault.delete(this.target);
          this.close();
        }),
    );
    buttonContainer.createEl("button", { text: "No" }, (el) =>
      el.onClickEvent(() => {
        if (this.settings.hideNoteInExplorer) {
          setupHide(file, this.fileExplorer.fileItems, true);
        }
        this.close();
      }),
    );
  }

  onOpen() {
    this.containerEl.addClass("warn");
    if (this.target instanceof TFile) this.deleteFolderNote(this.target);
    else if (this.target instanceof TFolder) this.deleteFolder(this.target);
  }

  onClose() {
    let { contentEl } = this;
    contentEl.empty();
  }
}
