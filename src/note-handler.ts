import ALxFolderNote from "main";
import { afItemMark, isFolder } from "misc";
import { TFile, AFItem, FileExplorer } from "obsidian";

export function setupHide(
  folderNoteFile: TFile,
  list: FileExplorer["fileItems"],
  revert = false,
) {
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
}

export function setupClick(afItem: AFItem, plugin: ALxFolderNote) {
  const item = afItem as afItemMark;
  if (isFolder(item) && !item.evtDone) {
    const { titleInnerEl } = item;
    // handle regular click
    plugin.registerDomEvent(titleInnerEl, "click", plugin.clickHandler);
    // handle middle click
    plugin.registerDomEvent(titleInnerEl, "auxclick", plugin.clickHandler);
    item.evtDone = true;
  }
}

export function initialize(this: ALxFolderNote) {
  const leaves = this.app.workspace.getLeavesOfType("file-explorer");
  if (leaves.length > 1) console.error("more then one file-explorer");
  else if (leaves.length < 1) console.error("file-explorer not found");
  else {
    const fileExplorer = this.fileExplorer ?? (leaves[0].view as FileExplorer);
    this.fileExplorer = fileExplorer;
    this.registerVaultEvent();
    // get all AbstractFile (file+folder) and attach event
    for (const key in fileExplorer.fileItems) {
      if (!Object.prototype.hasOwnProperty.call(fileExplorer.fileItems, key))
        continue;
      const item = fileExplorer.fileItems[key];
      if (isFolder(item)) {
        setupClick(item, this);
        const note = this.getFolderNote(item.file);
        if (note) setupHide(note, fileExplorer.fileItems);
      }
    }
  }
}
