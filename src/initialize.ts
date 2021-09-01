import { AFItem, FileExplorer } from "obsidian";

import ALxFolderNote from "./fn-main";
import { isFolder } from "./misc";
import FEHandler, { PatchRevealInExplorer } from "./modules/fe-handler";
import { noHideMark } from "./settings";

export default function initialize(this: ALxFolderNote, revert = false) {
  PatchRevealInExplorer(this);
  const leaves = this.app.workspace.getLeavesOfType("file-explorer");
  if (leaves.length > 1) console.error("more then one file-explorer");
  else if (leaves.length < 1) console.error("file-explorer not found");
  else {
    const fileExplorer = leaves[0].view as FileExplorer;
    const feHandler = new FEHandler(this, fileExplorer);
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
  }
}
