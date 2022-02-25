import { Platform, TFolder } from "obsidian";

import { isModifier } from "../misc";
import FEHandler from "./fe-handler";
import { LongPressEvent } from "./long-press";

const getClickHandler = (feHandler: FEHandler) => {
  const handleClickAsync = async (
    evt: MouseEvent,
    propagateOn: HTMLElement,
    clickActions: () => Promise<boolean> | boolean,
  ) => {
    try {
      // if click action failed, trigger click on parent
      if (!(await clickActions())) {
        if (evt.type === "click") propagateOn.click();
      }
    } catch (err) {
      console.error(err);
      if (evt.type === "click") propagateOn.click();
    }
  };

  const clickHanlder = (evt: MouseEvent) => {
    if (Platform.isMobile && !feHandler.plugin.settings.mobileClickToOpen)
      return;
    evt.stopPropagation();

    const titleInnerEl = evt.target as HTMLDivElement;
    const titleEl = titleInnerEl.parentElement as HTMLDivElement;
    const navFolder = titleEl?.parentElement as HTMLDivElement;
    const { getFolderNote, getFolderNotePath, getNewFolderNote } =
      feHandler.fncApi;

    // check if dblclick is triggered
    handleClickAsync(evt, titleEl, async (): Promise<boolean> => {
      try {
        if (!titleEl || !navFolder) {
          console.error("unable to get parents for", titleInnerEl);
          return false;
        }
        if (titleInnerEl.hasClass("is-being-renamed")) return false;
        if (evt.type === "auxclick" && evt.button !== 1) return false;

        // get the folder path
        if (!feHandler.files.has(navFolder)) {
          console.error("folder not found for el: ", navFolder);
          return false;
        }
        const folder = feHandler.files.get(navFolder) as TFolder;
        const createNew =
          (evt.type === "click" &&
            isModifier(evt, feHandler.plugin.settings.modifierForNewNote)) ||
          (evt.type === "auxclick" && evt.button === 1);

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
    });
  };
  const pressHandler = (evt: LongPressEvent) => {
    evt.preventDefault();
    const titleInnerEl = evt.target as HTMLDivElement;
    const navFolder = titleInnerEl.parentElement
      ?.parentElement as HTMLDivElement;

    if (!navFolder) {
      console.error("unable to get parents for", titleInnerEl);
      return false;
    }
    if (titleInnerEl.hasClass("is-being-renamed")) return;

    // get the folder path
    if (!feHandler.files.has(navFolder)) {
      console.error("folder not found for el: ", navFolder);
      return;
    }
    const folder = feHandler.files.get(navFolder) as TFolder;
    feHandler.toggleFocusFolder(folder);
  };

  return {
    click: clickHanlder,
    press: pressHandler,
  };
};

export default getClickHandler;
