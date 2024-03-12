import "./focus.less";

import type { FileExplorerView, FolderItem } from "obsidian";
import { TFolder } from "obsidian";

import type ALxFolderNote from "../fn-main";
import FEHandler_Base from "./base";

const focusedFolderCls = "alx-focused-folder";
const focusModeCls = "alx-folder-focus";

export default class FolderFocus extends FEHandler_Base {
  queues = {};
  constructor(plugin: ALxFolderNote, fileExplorer: FileExplorerView) {
    super(plugin, fileExplorer);
    const { workspace } = plugin.app;
    this.plugin.register(
      () => this.focusedFolder && this.toggleFocusFolder(null),
    );

    [
      workspace.on("file-menu", (menu, af) => {
        if (!(af instanceof TFolder) || af.isRoot()) return;
        menu.addItem((item) =>
          item
            .setTitle("Toggle Focus")
            .setIcon("crossed-star")
            .onClick(() => this.toggleFocusFolder(af)),
        );
      }),
    ].forEach(this.plugin.registerEvent.bind(this.plugin));
  }

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
        this.fileExplorer.tree.infinityScroll.compute();
        // @ts-ignore
        this.fileExplorer.tree.infinityScroll.scrollIntoView(item);
      });
    }
    console.log('§2§')
    this.fileExplorer.navFileContainerEl.toggleClass(focusModeCls, !!item);
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
}
