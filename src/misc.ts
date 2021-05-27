import assertNever from "assert-never";
import { AFItem, FolderItem, Modifier, TFolder } from "obsidian";

export type afItemMark = AFItem & { evtDone?: true; isFolderNote?: true };

export const isFolder = (item: AFItem): item is FolderItem =>
  (item as FolderItem).file instanceof TFolder;

export const isMac = () => navigator.userAgent.includes("Macintosh");

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
