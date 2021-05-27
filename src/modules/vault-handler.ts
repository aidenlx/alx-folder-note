import ALxFolderNote from "main";
import { afItemMark } from "misc";
import { TAbstractFile, TFolder } from "obsidian";
import path from "path";
import { NoteLoc } from "settings";
import { setupClick, setupHide } from "../note-handler";

export function onCreate(this: ALxFolderNote, af: TAbstractFile) {
  if (!(af instanceof TFolder)) return;
  if (!this.fileExplorer) {
    console.error("no fileExplorer");
    return;
  }
  const afItem = this.fileExplorer.fileItems[af.path] as afItemMark;
  setupClick(afItem, this);
}

export function onRename(
  this: ALxFolderNote,
  af: TAbstractFile,
  oldPath: string,
) {
  if (af instanceof TFolder) {
    if (!this.fileExplorer) {
      console.error("no fileExplorer");
      return;
    }
    const fileExplorer = this.fileExplorer;
    setupClick(fileExplorer.fileItems[af.path], this);
    // show old note
    const oldNote = this.getFolderNote(oldPath, af);
    if (oldNote) setupHide(oldNote, fileExplorer.fileItems, true);
    // hide new note
    const newNote = this.getFolderNote(af);
    if (newNote) setupHide(newNote, fileExplorer.fileItems);
    // sync
    if (this.settings.autoRename && !newNote && oldNote) {
      const { findIn, noteBaseName } = this.getAbstractFolderNote(af);
      this.app.vault.rename(
        oldNote,
        path.join(findIn.path, noteBaseName + ".md"),
      );
      setupHide(oldNote, fileExplorer.fileItems);
    }
  }
}
export function onDelete(this: ALxFolderNote, af: TAbstractFile) {
  if (
    af instanceof TFolder &&
    this.settings.folderNotePref === NoteLoc.Outside
  ) {
    if (!this.fileExplorer) {
      console.error("no fileExplorer");
      return;
    }
    const oldNote = this.getFolderNote(af);
    if (oldNote) setupHide(oldNote, this.fileExplorer.fileItems, true);
  }
}
