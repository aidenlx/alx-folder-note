import type { FileExplorerView } from "obsidian";

import type ALxFolderNote from "../fn-main";
import ActiveFolder from "./active-folder";
import FolderFocus from "./folder-focus";
import FolderMark from "./folder-mark";

const getFileExplorerHandlers = (
  plugin: ALxFolderNote,
  fileExplorer: FileExplorerView,
) => ({
  // initialized (mark folders, hook evt handlers...) when constructed
  plugin,
  folderFocus: new FolderFocus(plugin, fileExplorer),
  folderMark: new FolderMark(plugin, fileExplorer),
  activeFolder: new ActiveFolder(plugin, fileExplorer),
});

export default getFileExplorerHandlers;
