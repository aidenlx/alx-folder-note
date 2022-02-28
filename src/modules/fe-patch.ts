import { around } from "monkey-around";
import { TAbstractFile, TFile, TFolder } from "obsidian";
import type {
  FileExplorerView as FEViewCls,
  FolderItem as FolderItemCls,
  FileExplorerPlugin as FEPluginCls,
} from "obsidian";

import ALxFolderNote from "../fn-main";
import { getViewOfType } from "../misc";
import AddLongPressEvt, { LongPressEvent } from "./long-press";
import getClickHandler from "./click-handler";

const getFolderItemFromEl = (navEl: HTMLElement, view: FEViewCls) => {
  const folder = view.files.get(navEl);
  return folder instanceof TFolder
    ? (view.fileItems[folder.path] as FolderItemCls)
    : null;
};
/**
 * reset existing file explorer views
 */
const resetFileExplorer = async (plugin: ALxFolderNote) => {
  for (const leaf of plugin.app.workspace.getLeavesOfType("file-explorer")) {
    let state = leaf.getViewState();
    await leaf.setViewState({ type: "empty" });
    leaf.setViewState(state);
  }
};

export const monkeyPatch = (plugin: ALxFolderNote) => {
  const { getFolderFromNote } = plugin.CoreApi,
    { press, click } = getClickHandler(plugin.feHandler);

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
      onOpen: (next) =>
        function (this: FEViewCls) {
          AddLongPressEvt(plugin, this.dom.navFileContainerEl);
          this.containerEl.on(
            "auxclick",
            ".nav-folder",
            (evt: MouseEvent, navEl: HTMLElement) => {
              const item = getFolderItemFromEl(navEl, this);
              item && click.call(item, evt);
            },
          );
          this.containerEl.on(
            "long-press" as any,
            ".nav-folder",
            (evt: LongPressEvent, navEl: HTMLElement) => {
              const item = getFolderItemFromEl(navEl, this);
              item && press.call(item, evt);
            },
          );
          return next.call(this);
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
          if (!(await click.call(this, evt))) next.call(this, evt);
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
