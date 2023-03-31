import assertNever from "assert-never";
import {
  AFItem,
  App,
  FolderItem,
  Modifier,
  TAbstractFile,
  TFile,
  View,
  WorkspaceLeaf,
} from "obsidian";
import { Notice, Platform, TFolder, FileItem } from "obsidian";
import { dirname, extname, join } from "path";

export type afItemMark = AFItem & {
  evtDone?: true;
  isFolderNote?: true;
  isFolderWithNote?: true;
};

export const getViewOfType = <V extends View = View>(
  type: string,
  app: App,
): V | null => {
  const vc = app.viewRegistry.getViewCreatorByType(type);
  return vc ? (vc(new (WorkspaceLeaf as any)(app)) as V) : null;
};

export const isFolder = (item: AFItem): item is FolderItem =>
  (item as FolderItem).file instanceof TFolder;

export const isMd = (file: TFile | string) =>
  typeof file === "string" ? extname(file) === ".md" : file.extension === "md";

export enum NoteLoc {
  Index,
  Inside,
  Outside,
}

export const isModifier = (evt: MouseEvent, pref: Modifier): boolean => {
  const { altKey, metaKey, ctrlKey, shiftKey } = evt;
  switch (pref) {
    case "Mod":
      return Platform.isMacOS ? metaKey : ctrlKey;
    case "Ctrl":
      return ctrlKey;
    case "Meta":
      return metaKey;
    case "Shift":
      return shiftKey;
    case "Alt":
      return altKey;
    default:
      assertNever(pref);
  }
};

/**
 * @param newName include extension
 */
export const getRenamedPath = (af: TAbstractFile, newName: string) =>
  join(getParentPath(af.path), newName);

export const getParentPath = (src: string) => {
  const path = dirname(src);
  if (path === ".") return "/";
  else return path;
};

export class ClickNotice extends Notice {
  constructor(
    message: string | ((desc: DocumentFragment) => void),
    action: (evt: MouseEvent) => any,
    timeout?: number,
  ) {
    super(typeof message === "string" ? message : "", timeout);
    this.noticeEl.addEventListener("click", action);
    if (typeof message === "function") {
      this.noticeEl.empty();
      let frag = new DocumentFragment();
      message(frag);
      this.noticeEl.append(frag);
    }
  }
}

export function getFileItemTitleEl(fileItem: FileItem): HTMLElement {
  return fileItem.titleEl ?? fileItem.selfEl;
}

export function getFileItemInnerTitleEl(fileItem: FileItem): HTMLElement {
  return fileItem.titleInnerEl ?? fileItem.innerEl;
}
