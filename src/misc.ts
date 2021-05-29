import assertNever from "assert-never";
import { AFItem, FileExplorer, FolderItem, Modifier, TFolder } from "obsidian";

export type afItemMark = AFItem & { evtDone?: true; isFolderNote?: true };

export const isFolder = (item: AFItem): item is FolderItem =>
  (item as FolderItem).file instanceof TFolder;

export const isMac = () => navigator.userAgent.includes("Macintosh");

export enum NoteLoc {
  Index,
  Inside,
  Outside,
}

export function iterateItems(
  items: FileExplorer["fileItems"],
  callback: (item: AFItem) => any,
): void {
  for (const key in items) {
    if (!Object.prototype.hasOwnProperty.call(items, key)) continue;
    callback(items[key]);
  }
}

export function isModifier(evt: MouseEvent, pref: Modifier): boolean {
  const { altKey, metaKey, ctrlKey, shiftKey } = evt;
  switch (pref) {
    case "Mod":
      return isMac() ? metaKey : ctrlKey;
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
}
