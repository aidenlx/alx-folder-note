import { around } from "monkey-around";
import {
  AFItem,
  debounce,
  EventRef,
  FileExplorer,
  TAbstractFile,
  TFile,
  TFolder,
} from "obsidian";

import ALxFolderNote from "../fn-main";
import { afItemMark, isFolder } from "../misc";
import getClickHandler from "./click-handler";

const folderNoteClass = "alx-folder-note";
const folderClass = "alx-folder-with-note";

/** File Explorer Handler */
export default class FEHandler {
  plugin: ALxFolderNote;
  fileExplorer: FileExplorer;
  clickHandler: (evt: MouseEvent) => void;

  constructor(plugin: ALxFolderNote, explorer: FileExplorer) {
    this.plugin = plugin;
    this.clickHandler = getClickHandler(plugin);
    this.fileExplorer = explorer;
    const { vault } = plugin.app;
    let refs = [] as EventRef[];
    refs.push(
      vault.on("folder-note:create", (note: TFile, folder: TFolder) => {
        this.setMark(note);
        this.setMark(folder);
      }),
      vault.on("folder-note:delete", (note: TFile, folder: TFolder) => {
        this.setMark(note, true);
        this.setMark(folder, true);
      }),
      vault.on("folder-note:rename", () => {
        // fe-item in dom will be reused, do nothing for now
      }),
      vault.on("folder-note:cfg-changed", () => {
        this.markAll(true);
        window.setTimeout(this.markAll, 200);
      }),
    );
    refs.forEach((ref) => this.plugin.registerEvent(ref));
  }

  update = debounce(
    () => {
      for (const [path, revert] of this.waitingList) {
        this._setMark(path, revert);
      }
      this.waitingList.clear();
    },
    200,
    true,
  );

  waitingList: Map<string, boolean> = new Map();

  get api() {
    return this.plugin.CoreApi;
  }
  get files() {
    return this.fileExplorer.files;
  }

  private _setMark = (path: string, revert: boolean) => {
    const item = this.getAfItem(path);
    if (!item) {
      console.warn("no afitem found for path %s, escaping...", path);
      return;
    }
    if (isFolder(item) && revert === !!item.isFolderWithNote) {
      item.el.toggleClass(folderClass, !revert);
      item.isFolderWithNote = revert ? undefined : true;
    } else if (revert === !!item.isFolderNote) {
      item.el.toggleClass(folderNoteClass, !revert);
      item.isFolderNote = revert ? undefined : true;
    }
  };

  setMark = (target: AFItem | TAbstractFile, revert = false) => {
    if (!target) return;
    if (target instanceof TAbstractFile) {
      this.waitingList.set(target.path, revert);
    } else {
      this.waitingList.set(target.file.path, revert);
    }
    this.update();
  };

  getAfItem = (path: string): afItemMark | null =>
    this.fileExplorer.fileItems[path] ?? null;

  /**
   * @param revert when revert is true, set item.evtDone to undefined
   */
  setClick = (itemOrFolder: AFItem | TFolder, revert = false) => {
    const item: afItemMark | null =
      itemOrFolder instanceof TFolder
        ? this.getAfItem(itemOrFolder.path)
        : itemOrFolder;
    if (!item) {
      console.error("item not found with path %s", itemOrFolder);
      return;
    }
    if (isFolder(item)) {
      if (revert) {
        item.evtDone = undefined;
      } else if (!item.evtDone) {
        const { titleInnerEl } = item;
        // handle regular click
        this.plugin.registerDomEvent(titleInnerEl, "click", this.clickHandler);
        // handle middle click
        this.plugin.registerDomEvent(
          titleInnerEl,
          "auxclick",
          this.clickHandler,
        );
        item.evtDone = true;
      }
    }
  };

  markAll = (revert = false) => {
    this.iterateItems((item: AFItem) => {
      if (isFolder(item) && !revert) {
        this.markFolderNote(item.file);
      } else if (revert) {
        this.setMark(item, true);
      }
    });
  };

  markFolderNote = (af: TAbstractFile): boolean => {
    if (af instanceof TFolder && af.isRoot()) return false;
    const { getFolderNote, getFolderFromNote } = this.api;

    let found: TAbstractFile | null = null;
    if (af instanceof TFile) found = getFolderFromNote(af);
    else if (af instanceof TFolder) found = getFolderNote(af);

    if (found) {
      this.setMark(found);
      this.setMark(af);
    } else {
      this.setMark(af, true);
    }
    return !!found;
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

export const PatchRevealInExplorer = (plugin: ALxFolderNote) => {
  const { getFolderFromNote } = plugin.CoreApi;

  const feInstance =
    plugin.app.internalPlugins.plugins["file-explorer"]?.instance;
  if (feInstance) {
    const remover = around(feInstance, {
      revealInFolder: (next) => {
        return function (this: any, ...args: any[]) {
          if (args[0] instanceof TFile && plugin.settings.hideNoteInExplorer) {
            const findResult = getFolderFromNote(args[0]);
            if (findResult) args[0] = findResult;
          }
          return next.apply(this, args);
        };
      },
    });
    plugin.register(remover);
  }
};
