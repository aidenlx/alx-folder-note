import ALxFolderNote from "main";
import { isFolder } from "misc";
import { PatchRevealInExplorer } from "modules/commands";
import FEHandler from "modules/fe-handler";
import { AFItem, FileExplorer } from "obsidian";

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
    const setupClick = () => {
      feHandler.iterateItems((item: AFItem) => {
        if (isFolder(item)) {
          feHandler.setClickForAfItem(item, revert);
        }
      });
    };

    if (!revert) this.vaultHandler.registerEvent();
    setupClick();
    if (this.settings.hideNoteInExplorer) feHandler.hideAll(revert);
  }
}
