import { around } from "monkey-around";
import { FileExplorer, TFile } from "obsidian";

import ALxFolderNote from "./fn-main";
import FEHandler from "./modules/fe-handler";
import { folderIconMark, noHideNoteMark } from "./settings";

export default function initialize(this: ALxFolderNote, revert = false) {
  if (!revert) {
    PatchRevealInExplorer(this);
    this.setupActiveFolderHandlers();
  }

  const doWithFileExplorer = (callback: (view: FileExplorer) => void) => {
    let leaves,
      count = 0;
    const tryGetView = () => {
      leaves = this.app.workspace.getLeavesOfType("file-explorer");
      if (leaves.length === 0) {
        if (count++ > 5) console.error("failed to get file-explorer");
        else {
          console.log("file-explorer not found, retrying...");
          setTimeout(tryGetView, 500);
        }
      } else {
        if (leaves.length > 1) console.warn("more then one file-explorer");
        callback(leaves[0].view as FileExplorer);
      }
    };
    tryGetView();
  };

  const getViewHandler = (revert: boolean) => (view: FileExplorer) => {
    let feHandler: FEHandler;
    if (!this.feHandler) {
      const newHandler = new FEHandler(this, view);
      this.feHandler = newHandler;
      feHandler = newHandler;
    } else {
      this.feHandler.fileExplorer = view;
      feHandler = this.feHandler;
    }
    feHandler.setupClick(revert);
    feHandler.markAll(revert);
    document.body.toggleClass(
      noHideNoteMark,
      revert ? false : !this.settings.hideNoteInExplorer,
    );
    document.body.toggleClass(
      folderIconMark,
      revert ? false : this.settings.folderIcon,
    );

    if (!revert) {
      // when file explorer is closed (workspace changed)
      // try to update fehanlder with new file explorer instance
      this.register(
        around(view, {
          onClose: (next) =>
            function (this: FileExplorer) {
              setTimeout(() => doWithFileExplorer(getViewHandler(false)), 1e3);
              return next.apply(this);
            },
        }),
      );
    }
  };

  doWithFileExplorer(getViewHandler(revert));
}

const PatchRevealInExplorer = (plugin: ALxFolderNote) => {
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
