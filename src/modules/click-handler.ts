import ALxFolderNote from "main";
import { TFolder } from "obsidian";
import path from "path";
import { isModifier } from "misc";
import { findFolderNote } from "./find";

export function clickHandler(this: ALxFolderNote, evt: MouseEvent) {
  const titleInnerEl = evt.target as HTMLDivElement;
  const titleEl = titleInnerEl.parentElement as HTMLDivElement;
  const navFolder = titleEl?.parentElement as HTMLDivElement;

  const tryOpen = async (): Promise<boolean> => {
    try {
      if (!this.fileExplorer) throw new Error("fileExplorer Missing");
      if (!titleEl || !navFolder) {
        console.error("unable to get parents for", titleInnerEl);
        return false;
      }
      if (titleInnerEl.hasClass("is-being-renamed")) return false;
      if (evt.type === "auxclick" && evt.button !== 1) return false;

      evt.stopPropagation();
      // get the folder path
      if (!this.fileExplorer.files.has(navFolder)) {
        console.error("folder not found for el: ", navFolder);
        return false;
      }
      const folder = this.fileExplorer.files.get(navFolder) as TFolder;
      const createNew = isModifier(evt, this.settings.modifierForNewNote);

      // check if folder note exists
      const { findIn, noteBaseName } = this.getAbstractFolderNote(folder);
      let folderNote = findFolderNote(findIn, noteBaseName);
      if (createNew && !folderNote) {
        const noteInitContent = "# " + noteBaseName; //await this.expandContent(this.initContent);
        folderNote = await this.app.vault.create(
          path.join(findIn.path, noteBaseName + ".md"),
          noteInitContent,
        );
      }

      if (!folderNote) return false;

      // show the note
      await this.app.workspace.openLinkText(folderNote.path, "", createNew, {
        active: true,
      });
      return true;
    } catch (error) {
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
}
