import ALxFolderNote from "main";
import { afItemMark, isFolder } from "misc";
import { AFItem, FileExplorer, TFile } from "obsidian";

/** File Explorer Handler */
export default class FEHandler {
  plugin: ALxFolderNote;
  fileExplorer: FileExplorer;
  get finder() {
    return this.plugin.finder;
  }
  get files() {
    return this.fileExplorer.files;
  }
  constructor(plugin: ALxFolderNote, explorer: FileExplorer) {
    this.plugin = plugin;
    this.fileExplorer = explorer;
  }

  setupHide = (folderNote: TFile | AFItem, revert = false) => {
    if (!folderNote) return;
    const list = this.fileExplorer.fileItems;
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

  getAfItem = (path: string): AFItem | null =>
    this.fileExplorer.fileItems[path] ?? null;

  /**
   * @param revert when revert is true, set item.evtDone to undefined
   */
  setClickForAfItem = (itemOrPath: AFItem | string, revert = false) => {
    const item: afItemMark | null =
      typeof itemOrPath === "string" ? this.getAfItem(itemOrPath) : itemOrPath;
    if (!item) {
      console.error("item not found with path %s", itemOrPath);
      return;
    }
    if (isFolder(item)) {
      if (revert) {
        item.evtDone = undefined;
      } else if (!item.evtDone) {
        const { titleInnerEl } = item;
        // handle regular click
        this.plugin.registerDomEvent(
          titleInnerEl,
          "click",
          this.plugin.clickHandler,
        );
        // handle middle click
        this.plugin.registerDomEvent(
          titleInnerEl,
          "auxclick",
          this.plugin.clickHandler,
        );
        item.evtDone = true;
      }
    }
  };

  hideAll = (revert = false) => {
    this.iterateItems((item: AFItem) => {
      if (isFolder(item)) {
        if (!revert) {
          const note = this.finder.getFolderNote(item.file);
          if (note) this.setupHide(note);
        }
      } else if (revert) {
        this.setupHide(item, true);
      }
    });
  };

  iterateItems = (callback: (item: AFItem) => any): void => {
    const items = this.fileExplorer.fileItems;
    if (items)
      for (const key in items) {
        if (!Object.prototype.hasOwnProperty.call(items, key)) continue;
        callback(items[key]);
      }
  };
}
