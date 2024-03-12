import { around } from "monkey-around";
import type {
  FileExplorerPlugin as FEPluginCls,
  FileExplorerView as FEViewCls,
  FileExplorerView,
  FolderItem as FolderItemCls,
  TAbstractFile,
} from "obsidian";
import { TFile, TFolder } from "obsidian";

import { getClickHandler, pressHandler } from "./click-handler";
import getFileExplorerHandlers from "./fe-handler";
import type ALxFolderNote from "./fn-main";
import { getViewOfType } from "./misc";
import type { LongPressEvent } from "./modules/long-press";
import AddLongPressEvt from "./modules/long-press";

const getFolderItemFromEl = (navEl: HTMLElement, view: FEViewCls) => {
  const folder = view.files.get(navEl);
  return folder instanceof TFolder
    ? (view.fileItems[folder.path] as FolderItemCls)
    : null;
};
const Rt = (evt: MouseEvent, target: HTMLElement) => {
  const n = evt.relatedTarget;
  return !(n instanceof Node && target.contains(n));
};
/**
 * reset existing file explorer views
 */
const resetFileExplorer = async (plugin: ALxFolderNote) => {
  for (const leaf of plugin.app.workspace.getLeavesOfType("file-explorer")) {
    const state = leaf.getViewState();
    await leaf.setViewState({ type: "empty" });
    leaf.setViewState(state);
  }
};

const PatchFileExplorer = (plugin: ALxFolderNote) => {
  const { getFolderFromNote } = plugin.CoreApi,
    clickHandler = getClickHandler(plugin);

  let FileExplorerViewInst: FEViewCls | null = getViewOfType<FEViewCls>(
      "file-explorer",
      plugin.app,
    ),
    FileExplorerPluginInst =
      plugin.app.internalPlugins.plugins["file-explorer"]?.instance;
  if (!FileExplorerViewInst || !FileExplorerPluginInst) return;

  // get constructors
  const FileExplorerView = FileExplorerViewInst.constructor as typeof FEViewCls,
    FileExplorerPlugin =
      FileExplorerPluginInst.constructor as typeof FEPluginCls,
    FolderItem = FileExplorerViewInst.createFolderDom(
      plugin.app.vault.getRoot(),
    ).constructor as typeof FolderItemCls;

  FileExplorerViewInst = null;

  const uninstallers: ReturnType<typeof around>[] = [
    around(FileExplorerView.prototype, {
      load: (next) =>
        function (this: FEViewCls) {
          const self = this;
          next.call(self);
          self.folderNoteUtils = getFileExplorerHandlers(plugin, self);
          AddLongPressEvt(plugin, self.navFileContainerEl);
          self.containerEl.on(
            "auxclick",
            ".nav-folder",
            (evt: MouseEvent, navEl: HTMLElement) => {
              const item = getFolderItemFromEl(navEl, self);
              item && clickHandler(item, evt);
            },
          );
          self.containerEl.on(
            "long-press" as any,
            ".nav-folder",
            (evt: LongPressEvent, navEl: HTMLElement) => {
              const item = getFolderItemFromEl(navEl, self);
              item && pressHandler(item, evt);
            },
          );
        },
      onFileMouseover: (next) =>
        function (this: FileExplorerView, evt, navTitleEl) {
          next.call(this, evt, navTitleEl);
          if (!Rt(evt, navTitleEl)) return;
          const af = this.currentHoverFile;
          if (
            !af ||
            // if event is triggered on same file, do nothing
            (this._AFN_HOVER && this._AFN_HOVER === af) ||
            !(af instanceof TFolder)
          )
            return;
          const note = plugin.CoreApi.getFolderNote(af);
          if (note) {
            this.app.workspace.trigger("hover-link", {
              event: evt,
              source: "file-explorer",
              hoverParent: this,
              targetEl: navTitleEl,
              linktext: note.path,
            });
          }
          // indicate that this file is handled by monkey patch
          this._AFN_HOVER = af;
        },
      onFileMouseout: (next) =>
        function (this: FileExplorerView, evt, navTitleEl) {
          next.call(this, evt, navTitleEl);
          if (!Rt(evt, navTitleEl)) return;
          delete this._AFN_HOVER;
        },
    }),
    // patch reveal in folder to alter folder note target to linked folder
    around(FileExplorerPlugin.prototype, {
      revealInFolder: (next) =>
        function (this: FEPluginCls, file: TAbstractFile) {
          if (file instanceof TFile && plugin.settings.hideNoteInExplorer) {
            const findResult = getFolderFromNote(file);
            if (findResult) file = findResult;
          }
          return next.call(this, file);
        },
    }),
    around(FolderItem.prototype, {
      onTitleElClick: (next) =>
        async function (this: FolderItemCls, evt) {
          // if folder note click not success,
          // fallback to default
          if (!(await clickHandler(this, evt))) next.call(this, evt);
        },
      onSelfClick: (next) =>
        async function (this: FolderItemCls, evt) {
          // if folder note click not success,
          // fallback to default
          if (!(await clickHandler(this, evt))) next.call(this, evt);
        },
    }),
  ];
  resetFileExplorer(plugin);
  plugin.register(() => {
    // uninstall monkey patches
    uninstallers.forEach((revert) => revert());
    resetFileExplorer(plugin);
  });
};
export default PatchFileExplorer;
