import ALxFolderNote from "main";
import { TFile, TFolder, AFItem, FileExplorer, FolderItem } from "obsidian";
import path, { basename, dirname } from "path";
import { NoteLoc } from "settings";
import assertNever from "assert-never";
import { isModifier } from "misc";

type afItemMark = AFItem & { evtDone?: true; isFolderNote?: true };

const isFolder = (item: AFItem): item is FolderItem =>
  (item as FolderItem).file instanceof TFolder;

const getParentPath = (src: string) => {
  const path = dirname(src);
  if (path === ".") return "/";
  else return path;
};

export function getAbstractFolderNote(
  this: ALxFolderNote,
  path: string,
  folder: TFolder,
): {
  findIn: TFolder;
  noteBaseName: string;
};
export function getAbstractFolderNote(
  this: ALxFolderNote,
  folder: TFolder,
): {
  findIn: TFolder;
  noteBaseName: string;
};
export function getAbstractFolderNote(
  this: ALxFolderNote,
  src: TFolder | string,
  baseFolder?: TFolder,
): {
  findIn: TFolder;
  noteBaseName: string;
} {
  const getParent = (): TFolder => {
    if (typeof src === "string") {
      const found = this.app.vault.getAbstractFileByPath(getParentPath(src));
      if (found && found instanceof TFolder) return found;
      else {
        console.error(src, getParentPath(src));
        throw new Error("invalid path given");
      }
    } else {
      if (src.parent === undefined) {
        // root folder
        return src;
      } else if (src.parent === null) {
        // when the folder is a deleted one
        const parentPath = getParentPath(src.path);
        const foundParent = this.app.vault.getAbstractFileByPath(parentPath);
        if (foundParent && foundParent instanceof TFolder)
          return foundParent as TFolder;
        else {
          console.error(src);
          throw new Error("no parent folder found");
        }
      } else return src.parent;
    }
  };
  const { indexName, folderNotePref: folderNoteLoc } = this.settings;
  let findIn: TFolder, noteBaseName: string;

  switch (folderNoteLoc) {
    case NoteLoc.Index:
      noteBaseName = indexName;
      break;
    case NoteLoc.Inside:
    case NoteLoc.Outside:
      if (typeof src === "string") noteBaseName = basename(src);
      else
        noteBaseName = src.name === "/" ? this.app.vault.getName() : src.name;
      break;
    default:
      assertNever(folderNoteLoc);
  }
  switch (folderNoteLoc) {
    case NoteLoc.Index:
    case NoteLoc.Inside:
      if (typeof src === "string") {
        if (!baseFolder) throw new TypeError("baseFolder not provided");
        findIn = baseFolder;
      } else findIn = src;
      break;
    case NoteLoc.Outside:
      findIn = getParent();
      break;
    default:
      assertNever(folderNoteLoc);
  }
  return { findIn, noteBaseName };
}

export function findFolderNote(
  findIn: TFolder,
  noteBaseName: string,
): TFile | null {
  const found = findIn.children.find(
    (af) =>
      af instanceof TFile &&
      af.basename === noteBaseName &&
      af.extension === "md",
  );
  return (found as TFile) ?? null;
}

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

export function registerVaultEvent(this: ALxFolderNote) {
  // attach events on new folder
  this.registerEvent(
    this.app.vault.on("create", (af) => {
      if (!(af instanceof TFolder)) return;
      if (!this.fileExplorer) {
        console.error("no fileExplorer");
        return;
      }
      const afItem = this.fileExplorer.fileItems[af.path] as afItemMark;
      setupClick(afItem, this);
    }),
  );
  // include mv and rename
  this.registerEvent(
    this.app.vault.on("rename", (af, oldPath) => {
      if (af instanceof TFolder) {
        if (!this.fileExplorer) {
          console.error("no fileExplorer");
          return;
        }
        const fileExplorer = this.fileExplorer;
        setupClick(fileExplorer.fileItems[af.path], this);
        // show old note
        const oldNote = this.getFolderNote(oldPath, af);
        if (oldNote) setupHide(oldNote, fileExplorer.fileItems, true);
        // hide new note
        const newNote = this.getFolderNote(af);
        if (newNote) setupHide(newNote, fileExplorer.fileItems);
        // sync
        if (this.settings.autoRename && !newNote && oldNote) {
          const { findIn, noteBaseName } = this.getAbstractFolderNote(af);
          this.app.vault.rename(
            oldNote,
            path.join(findIn.path, noteBaseName + ".md"),
          );
          setupHide(oldNote, fileExplorer.fileItems);
        }
      }
    }),
  );
  this.registerEvent(
    this.app.vault.on("delete", (af) => {
      if (
        af instanceof TFolder &&
        this.settings.folderNotePref === NoteLoc.Outside
      ) {
        if (!this.fileExplorer) {
          console.error("no fileExplorer");
          return;
        }
        const oldNote = this.getFolderNote(af);
        if (oldNote) setupHide(oldNote, this.fileExplorer.fileItems, true);
      }
    }),
  );
}

export function setupHide(
  folderNoteFile: TFile,
  list: FileExplorer["fileItems"],
  revert = false,
) {
  if (!folderNoteFile) return;
  const folderNote = list[folderNoteFile.path] as afItemMark;
  if (!revert && !folderNote.isFolderNote) {
    folderNote.titleEl.style.display = "none";
    folderNote.isFolderNote = true;
    // item.isFolderNote = true;
  } else if (revert && folderNote.isFolderNote) {
    folderNote.titleEl.style.display = "";
    folderNote.isFolderNote = undefined;
    // item.isFolderNote = undefined;
  }
}

export function setupClick(afItem: AFItem, plugin: ALxFolderNote) {
  const item = afItem as afItemMark;
  if (isFolder(item) && !item.evtDone) {
    const { titleInnerEl } = item;
    // handle regular click
    plugin.registerDomEvent(titleInnerEl, "click", plugin.clickHandler);
    // handle middle click
    plugin.registerDomEvent(titleInnerEl, "auxclick", plugin.clickHandler);
    item.evtDone = true;
  }
}

export function initialize(this: ALxFolderNote) {
  const leaves = this.app.workspace.getLeavesOfType("file-explorer");
  if (leaves.length > 1) console.error("more then one file-explorer");
  else if (leaves.length < 1) console.error("file-explorer not found");
  else {
    const fileExplorer = this.fileExplorer ?? (leaves[0].view as FileExplorer);
    console.log("in file-explorer");
    this.fileExplorer = fileExplorer;
    this.registerVaultEvent();
    // get all AbstractFile (file+folder) and attach event
    for (const key in fileExplorer.fileItems) {
      if (!Object.prototype.hasOwnProperty.call(fileExplorer.fileItems, key))
        continue;
      const item = fileExplorer.fileItems[key];
      if (isFolder(item)) {
        setupClick(item, this);
        const note = this.getFolderNote(item.file);
        if (note) setupHide(note, fileExplorer.fileItems);
      }
    }
  }
}
