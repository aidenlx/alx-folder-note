import { TFolder } from "obsidian";

import ALxFolderNote from "../fn-main";
import { isModifier } from "../misc";

const getClickHandler = (plugin: ALxFolderNote) => (evt: MouseEvent) => {
  const titleInnerEl = evt.target as HTMLDivElement;
  const titleEl = titleInnerEl.parentElement as HTMLDivElement;
  const navFolder = titleEl?.parentElement as HTMLDivElement;
  const { getFolderNote, getFolderNotePath, getNewFolderNote } = plugin.CoreApi;

  const tryOpen = async (): Promise<boolean> => {
    try {
      if (!plugin.feHandler) throw new Error("fileExplorer Missing");
      if (!titleEl || !navFolder) {
        console.error("unable to get parents for", titleInnerEl);
        return false;
      }
      if (titleInnerEl.hasClass("is-being-renamed")) return false;
      if (evt.type === "auxclick" && evt.button !== 1) return false;

      evt.stopPropagation();
      // get the folder path
      if (!plugin.feHandler.files.has(navFolder)) {
        console.error("folder not found for el: ", navFolder);
        return false;
      }
      const folder = plugin.feHandler.files.get(navFolder) as TFolder;
      const createNew =
        (evt.type === "click" &&
          isModifier(evt, plugin.settings.modifierForNewNote)) ||
        (evt.type === "auxclick" && evt.button === 1);

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
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };
  tryOpen()
    .then((success) => {
      if (!success && evt.type === "click") titleEl.click();
    })
    .catch((e) => {
      console.error(e);
      if (evt.type === "click") titleEl.click();
    });
};

export default getClickHandler;
