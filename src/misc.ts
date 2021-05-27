import assertNever from "assert-never";
import { Modifier } from "obsidian";

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
