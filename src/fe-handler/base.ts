import "./file-explorer.less";

import { AFItem, FileExplorerView } from "obsidian";

import ALxFolderNote from "../fn-main";
import { afItemMark } from "../misc";

export default class FEHandler_Base {
  longPressRegistered = new WeakSet<FileExplorerView>();
  constructor(
    public plugin: ALxFolderNote,
    public fileExplorer: FileExplorerView,
  ) {}
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
  iterateItems = (callback: (item: AFItem) => any): void =>
    Object.values(this.fileExplorer.fileItems).forEach(callback);
}
