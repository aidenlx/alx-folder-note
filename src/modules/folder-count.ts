import { FolderItem } from "obsidian";
import "../styles/folder-count.css";
export function setCount(item: FolderItem) {
  // @ts-ignore
  const count = item.file.getFileCount() as number;
  item.titleInnerEl.dataset["count"] = count.toString();
}
