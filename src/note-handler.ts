import ALxFolderNote from "main";
import { afItemMark, isFolder, iterateItems } from "misc";
import { clickHandler } from "modules/click-handler";
import { PatchRevealInExplorer } from "modules/commands";
import { TFile, AFItem, FileExplorer } from "obsidian";

export function setupHide(
  folderNote: TFile | AFItem,
  list: FileExplorer["fileItems"],
  revert = false,
) {
  if (!folderNote) return;

  let item: afItemMark;
  if (folderNote instanceof TFile) item = list[folderNote.path] as afItemMark;
  else item = folderNote as afItemMark;

  if (!revert && !item.isFolderNote) {
    item.titleEl.style.display = "none";
    item.isFolderNote = true;
  } else if (revert && item.isFolderNote) {
    item.titleEl.style.display = "";
    item.isFolderNote = undefined;
  }
}

/**
 * @param revert when revert is true, set item.evtDone to undefined
 */
export function setupClick(
  afItem: AFItem,
  plugin: ALxFolderNote,
  revert = false,
) {
  const item = afItem as afItemMark;
  if (isFolder(item)) {
    if (revert) {
      item.evtDone = undefined;
    } else if (!item.evtDone) {
      const { titleInnerEl } = item;
      // handle regular click
      plugin.registerDomEvent(titleInnerEl, "click", clickHandler.bind(plugin));
      // handle middle click
      plugin.registerDomEvent(
        titleInnerEl,
        "auxclick",
        clickHandler.bind(plugin),
      );
      item.evtDone = true;
    }
  }
}

export const initialize = (plugin: ALxFolderNote, revert = false) => {
  PatchRevealInExplorer(plugin);
  const leaves = plugin.app.workspace.getLeavesOfType("file-explorer");
  if (leaves.length > 1) console.error("more then one file-explorer");
  else if (leaves.length < 1) console.error("file-explorer not found");
  else {
    const fileExplorer =
      plugin.fileExplorer ?? (leaves[0].view as FileExplorer);
    plugin.fileExplorer = fileExplorer;
    if (!revert) plugin.registerVaultEvent();
    // get all AbstractFile (file+folder) and attach event
    iterateItems(fileExplorer.fileItems, (item: AFItem) => {
      if (isFolder(item)) {
        setupClick(item, plugin, revert);
      }
    });
    if (plugin.settings.hideNoteInExplorer) hideAll(plugin, revert);
  }
};

export function hideAll(plugin: ALxFolderNote, revert = false) {
  if (!plugin.fileExplorer) throw new Error("fileExplorer Missing");
  const items = plugin.fileExplorer.fileItems;
  iterateItems(items, (item: AFItem) => {
    if (isFolder(item)) {
      if (!revert) {
        const note = plugin.getFolderNote(item.file);
        if (note) setupHide(note, items);
      }
    } else if (revert) {
      setupHide(item, items, true);
    }
  });
}
