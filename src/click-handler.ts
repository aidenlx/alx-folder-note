import type { FolderItem } from "obsidian";
import { Platform } from "obsidian";

import type ALxFolderNote from "./fn-main";
import { isModifier, getFileItemInnerTitleEl } from "./misc";
import type { LongPressEvent } from "./modules/long-press";

export const getClickHandler = (plugin: ALxFolderNote) => {
  const { getFolderNote, getFolderNotePath, getNewFolderNote } = plugin.CoreApi;
  return async (item: FolderItem, evt: MouseEvent): Promise<boolean> => {
    if (
      !item ||
      (Platform.isMobile && !plugin.settings.mobileClickToOpen) ||
      // allow folder shift selection to work
      evt.shiftKey ||
      // triggered only when click on title
      !(
        getFileItemInnerTitleEl(item) === evt.target ||
        getFileItemInnerTitleEl(item).contains(evt.target as Node)
      ) ||
      // ignore file being renamed
      item.view.fileBeingRenamed === item.file
    )
      return false;

    if (evt.type === "auxclick" && evt.button !== 1) return false;

    // get the folder path
    const folder = item.file;
    const createNew =
      (evt.type === "click" &&
        isModifier(evt, plugin.settings.modifierForNewNote)) ||
      (evt.type === "auxclick" && evt.button === 1);
    try {
      // check if folder note exists
      let folderNote = getFolderNote(folder),
        fnPath;
      if (createNew && !folderNote && (fnPath = getFolderNotePath(folder))) {
        folderNote = await plugin.app.vault.create(
          fnPath.path,
          getNewFolderNote(folder),
        );
      }

      if (!folderNote) return false;

      // show the note
      await plugin.app.workspace.openLinkText(
        folderNote.path,
        "",
        createNew || evt.type === "auxclick",
        { active: true },
      );
      if (plugin.settings.expandFolderOnClick && item.collapsed)
        await item.setCollapsed(false);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };
};
export const pressHandler = (
  item: FolderItem,
  _evt: LongPressEvent,
): boolean => {
  if (!item || item.view.fileBeingRenamed === item.file) return false;
  const folder = item.file;
  item.view.folderNoteUtils?.folderFocus.toggleFocusFolder(folder);
  return true;
};
