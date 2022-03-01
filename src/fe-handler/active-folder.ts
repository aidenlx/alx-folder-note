import {
  FileExplorerView,
  MarkdownView,
  TFolder,
  WorkspaceLeaf,
} from "obsidian";

import type ALxFolderNote from "../fn-main";
import FEHandler_Base from "./base";

const isActiveClass = "is-active";

export default class ActiveFolder extends FEHandler_Base {
  queues = {};
  constructor(plugin: ALxFolderNote, fileExplorer: FileExplorerView) {
    super(plugin, fileExplorer);
    const { workspace } = plugin.app;
    this.handleActiveLeafChange(workspace.activeLeaf);
    plugin.registerEvent(
      workspace.on(
        "active-leaf-change",
        this.handleActiveLeafChange.bind(this),
      ),
    );
    this.plugin.register(() => (this.activeFolder = null));
  }
  private _activeFolder: TFolder | null = null;
  public set activeFolder(folder: TFolder | null) {
    const getTitleEl = (folder: TFolder | null) =>
      folder ? this.fileExplorer.fileItems[folder.path]?.titleEl : undefined;
    if (!folder) {
      getTitleEl(this._activeFolder)?.removeClass(isActiveClass);
    } else if (folder !== this._activeFolder) {
      getTitleEl(this._activeFolder)?.removeClass(isActiveClass);
      getTitleEl(folder)?.addClass(isActiveClass);
    }
    this._activeFolder = folder;
  }
  public get activeFolder(): TFolder | null {
    return this._activeFolder;
  }
  private handleActiveLeafChange(leaf: WorkspaceLeaf | null) {
    let folder;
    if (
      leaf &&
      leaf.view instanceof MarkdownView &&
      (folder = this.fncApi.getFolderFromNote(leaf.view.file))
    ) {
      this.activeFolder = folder;
    } else {
      this.activeFolder = null;
    }
  }
}
