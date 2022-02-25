import "./folder-icon.less";
import "./focus.less";

import { getApi } from "@aidenlx/obsidian-icon-shortcodes";
import {
  AFItem,
  CachedMetadata,
  debounce,
  EventRef,
  FileExplorer,
  FolderItem,
  TAbstractFile,
  TFile,
  TFolder,
} from "obsidian";
import { dirname } from "path";

import ALxFolderNote from "../fn-main";
import { afItemMark, isFolder } from "../misc";
import getClickHandler from "./click-handler";
import AddLongPressEvt, { LongPressEvent } from "./long-press";

const folderNoteClass = "alx-folder-note";
const folderClass = "alx-folder-with-note";
const emptyFolderClass = "alx-empty-folder";

const focusedFolderCls = "alx-focused-folder";
const focusModeCls = "alx-folder-focus";

class FEHandler_Base {
  private _fe: FileExplorer;
  constructor(public plugin: ALxFolderNote, fe: FileExplorer) {
    this._fe = fe;
    AddLongPressEvt(plugin, fe.dom.navFileContainerEl);
  }
  get fileExplorer() {
    return this._fe;
  }
  set fileExplorer(fe: FileExplorer) {
    if (this._fe !== fe) {
      AddLongPressEvt(this.plugin, fe.dom.navFileContainerEl);
    }
    this._fe = fe;
  }
  get fncApi() {
    return this.plugin.CoreApi;
  }
  get app() {
    return this.plugin.app;
  }
  get files() {
    return this.fileExplorer.files;
  }
  getAfItem = (path: string): afItemMark | null =>
    this.fileExplorer.fileItems[path] ?? null;
  iterateItems = (callback: (item: AFItem) => any): void => {
    const items = this.fileExplorer.fileItems;
    if (items)
      for (const key in items) {
        if (!Object.prototype.hasOwnProperty.call(items, key)) continue;
        callback(items[key]);
      }
  };
}

/** File Explorer Handler */
export default class FEHandler extends FEHandler_Base {
  constructor(plugin: ALxFolderNote, explorer: FileExplorer) {
    super(plugin, explorer);
    const { vault, metadataCache, workspace } = plugin.app;
    let refs = [] as EventRef[];
    const updateIcon = () => {
      for (const path of this.foldersWithIcon) {
        this.setMark(path);
      }
    };
    //#region focus folder setup
    refs.push(
      workspace.on("file-menu", (menu, af, source) => {
        if (!(af instanceof TFolder) || af.isRoot()) return;
        menu.addItem((item) =>
          item
            .setTitle("Toggle Focus")
            .setIcon("crossed-star")
            .onClick(() => this.toggleFocusFolder(af)),
        );
      }),
    );
    this.plugin.register(
      () => this.focusedFolder && this.toggleFocusFolder(null),
    );
    //#endregion

    //#region folder note events setup
    refs.push(
      vault.on("create", (af) => af instanceof TFolder && this.setClick(af)),
      vault.on("folder-note:create", (note: TFile, folder: TFolder) => {
        this.setMark(note);
        this.setMark(folder);
        this.setClick(folder);
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
      metadataCache.on("changed", (file) => {
        let folder;
        if ((folder = this.fncApi.getFolderFromNote(file))) {
          this.setMark(folder);
        }
      }),
      vault.on("iconsc:initialized", updateIcon),
      vault.on("iconsc:changed", updateIcon),
    );
    //#endregion

    //#region empty folder detection
    if (this.plugin.settings.hideCollapseIndicator) {
      refs.push(
        vault.on("create", (file) => this.setChangedFolder(file.parent.path)),
        vault.on("delete", (file) => {
          let parent = dirname(file.path);
          this.setChangedFolder(parent === "." ? "/" : parent);
        }),
        vault.on("rename", (file, oldPath) => {
          this.setChangedFolder(file.parent.path);
          let parent = dirname(oldPath);
          this.setChangedFolder(parent === "." ? "/" : parent);
        }),
      );
    }
    //#endregion
    refs.forEach((ref) => this.plugin.registerEvent(ref));
  }

  //#region set class mark for folder notes and folders
  private setMarkQueue: Map<string, boolean> = new Map();
  private updateMark = debounce(
    () => {
      if (this.setMarkQueue.size > 0) {
        this.setMarkQueue.forEach((revert, path) =>
          this._setMark(path, revert),
        );
        this.setMarkQueue.clear();
      }
    },
    200,
    true,
  );
  private _setMark = (path: string, revert: boolean) => {
    const item = this.getAfItem(path);
    if (!item) {
      console.warn("no afitem found for path %s, escaping...", path);
      return;
    }
    if (isFolder(item)) {
      if (revert === !!item.isFolderWithNote) {
        item.el.toggleClass(folderClass, !revert);
        item.isFolderWithNote = revert ? undefined : true;
        if (this.plugin.settings.hideCollapseIndicator)
          item.el.toggleClass(
            emptyFolderClass,
            revert ? false : item.file.children.length === 1,
          );
      }
      this._updateIcon(path, revert, item);
    } else if (revert === !!item.isFolderNote) {
      item.el.toggleClass(folderNoteClass, !revert);
      item.isFolderNote = revert ? undefined : true;
    }
  };
  setMark = (target: AFItem | TAbstractFile | string, revert = false) => {
    if (!target) return;
    if (target instanceof TAbstractFile) {
      this.setMarkQueue.set(target.path, revert);
    } else if (typeof target === "string") {
      this.setMarkQueue.set(target, revert);
    } else {
      this.setMarkQueue.set(target.file.path, revert);
    }
    this.updateMark();
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
    const { getFolderNote, getFolderFromNote } = this.fncApi;

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
  // #endregion

  //#region set click handler for folders with folder note
  private clickHandler = getClickHandler(this);
  private setClickQueue: Map<
    string,
    [folder: AFItem | TFolder, revert: boolean]
  > = new Map();
  private updateClick = debounce(
    () => {
      if (this.setClickQueue.size > 0) {
        this.setClickQueue.forEach((param) => this._setClick(...param));
        this.setClickQueue.clear();
      }
    },
    200,
    true,
  );
  /**
   * @param revert when revert is true, set item.evtDone to undefined
   */
  _setClick = (target: AFItem | TFolder, revert = false) => {
    const item: afItemMark | null =
      target instanceof TFolder ? this.getAfItem(target.path) : target;
    if (!item) {
      console.error("item not found with path %s", target);
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
          this.clickHandler.click,
        );
        // handle middle click
        this.plugin.registerDomEvent(
          titleInnerEl,
          "auxclick",
          this.clickHandler.click,
        );
        // handle double click
        // @ts-ignore
        this.plugin.registerDomEvent(
          titleInnerEl,
          "long-press",
          this.clickHandler.press,
        );
        item.evtDone = true;
      }
    }
  };
  setClick = (target: AFItem | TFolder, revert = false) => {
    if (!target) return;
    if (target instanceof TFolder) {
      this.setClickQueue.set(target.path, [target, revert]);
    } else {
      this.setClickQueue.set(target.file.path, [target, revert]);
    }
    this.updateClick();
  };
  //#endregion

  //#region set hide collapse indicator
  private setChangedFolderQueue: Set<string> = new Set();
  private updateChangedFolder = debounce(
    () => {
      if (this.setChangedFolderQueue.size > 0) {
        this.setChangedFolderQueue.forEach((path) => {
          let note = this.fncApi.getFolderNote(path);
          if (note) {
            (this.getAfItem(path) as FolderItem)?.el.toggleClass(
              emptyFolderClass,
              note.parent.children.length === 1,
            );
          }
        });
        this.setChangedFolderQueue.clear();
      }
    },
    200,
    true,
  );
  setChangedFolder = (folderPath: string) => {
    if (!folderPath || folderPath === "/") return;
    this.setChangedFolderQueue.add(folderPath);
    this.updateChangedFolder();
  };
  //#endregion

  //#region folder icon setup
  foldersWithIcon = new Set<string>();
  private get shouldSetIcon(): boolean {
    return this.plugin.settings.folderIcon && !!getApi(this.plugin);
  }
  private _updateIcon(path: string, revert: boolean, item: afItemMark) {
    if (!this.shouldSetIcon) return;
    const api = getApi(this.plugin) as NonNullable<ReturnType<typeof getApi>>;

    let folderNotePath: string | undefined,
      metadata: CachedMetadata | undefined;
    const revertIcon = () => {
      delete item.el.dataset.icon;
      delete item.el.dataset["icon-type"];
      this.foldersWithIcon.delete(path);
      item.el.style.removeProperty("--alx-folder-icon-txt");
      item.el.style.removeProperty("--alx-folder-icon-url");
    };
    if (revert) {
      revertIcon();
    } else if (
      (folderNotePath = this.fncApi.getFolderNotePath(path)?.path) &&
      (metadata = this.plugin.app.metadataCache.getCache(folderNotePath))
    ) {
      let iconId = metadata.frontmatter?.icon,
        icon;
      if (
        iconId &&
        typeof iconId === "string" &&
        (icon = api.getIcon(iconId, true))
      ) {
        this.foldersWithIcon.add(path);
        item.el.dataset.icon = iconId.replace(/^:|:$/g, "");
        if (!api.isEmoji(iconId)) {
          item.el.dataset.iconType = "svg";
          item.el.style.setProperty("--alx-folder-icon-url", `url("${icon}")`);
          item.el.style.setProperty("--alx-folder-icon-txt", '"  "');
        } else {
          item.el.dataset.iconType = "emoji";
          item.el.style.setProperty("--alx-folder-icon-url", '""');
          item.el.style.setProperty("--alx-folder-icon-txt", `"${icon}"`);
        }
      } else if (item.el.dataset.icon) {
        revertIcon();
      }
    }
  }
  //#endregion

  //#region folder focus setup
  private _focusedFolder: {
    folder: FolderItem;
    collapsedCache: boolean;
  } | null = null;
  get focusedFolder() {
    return this._focusedFolder?.folder ?? null;
  }
  set focusedFolder(item: FolderItem | null) {
    // restore previous folder collapse state
    if (this._focusedFolder) {
      const { folder, collapsedCache } = this._focusedFolder;
      if (folder.collapsed !== collapsedCache)
        folder.setCollapsed(collapsedCache);
    }
    this._focusedFolder = item
      ? { folder: item, collapsedCache: item.collapsed }
      : null;
    // unfold folder if it's collapsed
    if (item && item.collapsed) {
      item.setCollapsed(false);
      // @ts-ignore
      this.plugin.app.nextFrame(() => {
        // @ts-ignore
        this.fileExplorer.dom.infinityScroll.computeSync();
        // @ts-ignore
        this.fileExplorer.dom.infinityScroll.scrollIntoView(item);
      });
    }
    this.fileExplorer.dom.navFileContainerEl.toggleClass(focusModeCls, !!item);
  }
  toggleFocusFolder(folder: TFolder | null) {
    const folderItem = folder
      ? (this.getAfItem(folder.path) as FolderItem | null)
      : null;
    if (this.focusedFolder) {
      this._focusFolder(this.focusedFolder, true);
    }
    // if given same folder as current cached, toggle it off
    if (folderItem && folderItem.file.path === this.focusedFolder?.file.path) {
      this.focusedFolder = null;
    } else {
      folderItem && this._focusFolder(folderItem, false);
      this.focusedFolder = folderItem;
    }
  }
  private _focusFolder(folder: FolderItem, revert = false) {
    if (folder.file.isRoot()) throw new Error("Cannot focus on root dir");
    folder.el.toggleClass(focusedFolderCls, !revert);
  }
  //#endregion
}
