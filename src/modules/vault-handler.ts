import ALxFolderNote from "main";
import { afItemMark, NoteLoc } from "misc";
import { TAbstractFile, TFile, TFolder } from "obsidian";
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
    if (this.settings.autoRename && !newNote && oldNote) {
      const { findIn, noteBaseName } = getAbstractFolderNote(this, af);
      this.app.vault.rename(oldNote, join(findIn.path, noteBaseName + ".md"));
      if (this.settings.hideNoteInExplorer)
        setupHide(oldNote, fileExplorer.fileItems);
    }
  } else if (af instanceof TFile) {
    let oldFolder;
    if (
      extname(oldPath) === ".md" &&
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
  if (
    af instanceof TFolder &&
    this.settings.folderNotePref === NoteLoc.Outside &&
    this.settings.hideNoteInExplorer
  ) {
    if (!this.fileExplorer) {
      console.error("no fileExplorer");
      return;
    }
    const oldNote = this.getFolderNote(af);
    if (oldNote) setupHide(oldNote, this.fileExplorer.fileItems, true);
  }
}
