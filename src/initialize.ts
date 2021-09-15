import { AFItem, App, FileExplorer } from "obsidian";

import ALxFolderNote from "./fn-main";
import { isFolder } from "./misc";
import FEHandler, { PatchRevealInExplorer } from "./modules/fe-handler";
import { noHideMark } from "./settings";

export default function initialize(this: ALxFolderNote, revert = false) {
  PatchRevealInExplorer(this);

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

  doWithFileExplorer((view) => {
    const feHandler = new FEHandler(this, view);
    this.feHandler = feHandler;
    /** get all AbstractFile (file+folder) and attach event */
    const setupClick = (re: boolean) => {
      feHandler.iterateItems((item: AFItem) => {
        if (isFolder(item)) {
          feHandler.setClick(item, re);
        }
      });
    };

    setupClick(revert);
    feHandler.markAll(revert);
    document.body.toggleClass(noHideMark, !this.settings.hideNoteInExplorer);
  });
}
