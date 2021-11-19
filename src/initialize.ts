import { around } from "monkey-around";
import { AFItem, FileExplorer } from "obsidian";

import ALxFolderNote from "./fn-main";
import { isFolder } from "./misc";
import FEHandler, { PatchRevealInExplorer } from "./modules/fe-handler";
import { noHideMark } from "./settings";

export default function initialize(this: ALxFolderNote, revert = false) {
  if (!revert) {
    PatchRevealInExplorer(this);
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
  /** get all AbstractFile (file+folder) and attach event */
  const setupClick = (feHandler: FEHandler, re: boolean) => {
    feHandler.iterateItems((item: AFItem) => {
      if (isFolder(item)) {
        feHandler.setClick(item, re);
      }
    });
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
    setupClick(feHandler, revert);
    feHandler.markAll(revert);
    document.body.toggleClass(
      noHideMark,
      revert ? false : !this.settings.hideNoteInExplorer,
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
