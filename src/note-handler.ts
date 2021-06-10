import ALxFolderNote from "main";
import { afItemMark, isFolder, iterateItems } from "misc";
import { clickHandler } from "modules/click-handler";
import { getFolderNote } from "modules/find";
import { AFItem, FileExplorer, TFile } from "obsidian";

export const setupHide = (
  folderNote: TFile | AFItem,
  list: FileExplorer["fileItems"],
  revert = false,
) => {
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
};

/**
 * @param revert when revert is true, set item.evtDone to undefined
 */
export const setupClick = (
  afItem: AFItem,
  plugin: ALxFolderNote,
  revert = false,
) => {
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
};

export const hideAll = (plugin: ALxFolderNote, revert = false) => {
  if (!plugin.fileExplorer) throw new Error("fileExplorer Missing");
  const items = plugin.fileExplorer.fileItems;
  iterateItems(items, (item: AFItem) => {
    if (isFolder(item)) {
      if (!revert) {
        const note = getFolderNote(plugin, item.file);
        if (note) setupHide(note, items);
      }
    } else if (revert) {
      setupHide(item, items, true);
    }
  });
};
