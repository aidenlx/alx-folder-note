import { FolderItem, Platform } from "obsidian";

import { isModifier } from "../misc";
import FEHandler from "./fe-handler";
import { LongPressEvent } from "./long-press";

const getClickHandler = (feHandler: FEHandler) => {
  const { getFolderNote, getFolderNotePath, getNewFolderNote } =
    feHandler.fncApi;
  const clickHanlder = async function (
    this: FolderItem,
    evt: MouseEvent,
  ): Promise<boolean> {
    if (
      !this ||
      this.collapseIndicatorEl === evt.target ||
      this.collapseIndicatorEl.contains(evt.target as Node) ||
      this.fileExplorer.fileBeingRenamed === this.file ||
      (Platform.isMobile && !feHandler.plugin.settings.mobileClickToOpen)
    )
      return false;
    // check if dblclick is triggered
    if (evt.type === "auxclick" && evt.button !== 1) return false;

    // get the folder path
    const folder = this.file;
    const createNew =
      (evt.type === "click" &&
        isModifier(evt, feHandler.plugin.settings.modifierForNewNote)) ||
      (evt.type === "auxclick" && evt.button === 1);
    try {
      // check if folder note exists
      let folderNote = getFolderNote(folder),
        fnPath;
      if (createNew && !folderNote && (fnPath = getFolderNotePath(folder))) {
        folderNote = await feHandler.app.vault.create(
          fnPath.path,
          getNewFolderNote(folder),
        );
      }

      if (!folderNote) return false;

      // show the note
      await feHandler.app.workspace.openLinkText(
        folderNote.path,
        "",
        createNew || evt.type === "auxclick",
        { active: true },
      );
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };
  const pressHandler = function (
    this: FolderItem,
    _evt: LongPressEvent,
  ): boolean {
    if (!this || this.fileExplorer.fileBeingRenamed === this.file) return false;
    const folder = this.file;
    feHandler.toggleFocusFolder(folder);
    return true;
  };

  return {
    click: clickHanlder,
    press: pressHandler,
  };
};

export default getClickHandler;
