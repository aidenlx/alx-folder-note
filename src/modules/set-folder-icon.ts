import type { IconInfo } from "@aidenlx/obsidian-icon-shortcodes/lib/icon-packs/types";
import { MarkdownView, TFile, TFolder } from "obsidian";

import type ALxFolderNote from "../fn-main";

const registerSetFolderIconCmd = (plugin: ALxFolderNote) => {
  const { workspace, vault, fileManager } = plugin.app;
  const setIconField = async (icon: IconInfo | null, file: TFile) => {
    if (!icon) return;
    await fileManager.processFrontMatter(file, (fm) => {
      fm.icon = icon.id;
    });
  };
  plugin.addCommand({
    id: "set-folder-icon",
    name: "Set Folder Icon",
    checkCallback: (checking) => {
      const iscAPI = plugin.IconSCAPI;
      if (!iscAPI) return false;
      const mdView = workspace.getActiveViewOfType(MarkdownView);
      if (!mdView) return false;
      const folder = plugin.CoreApi.getFolderFromNote(mdView.file);
      if (!folder) return false;
      if (checking) return true;
      iscAPI.getIconFromUser().then((icon) => setIconField(icon, mdView.file));
    },
  });
  plugin.registerEvent(
    workspace.on("file-menu", (menu, af, src) => {
      const iscAPI = plugin.IconSCAPI;
      if (!iscAPI) return;
      let note;
      if (
        (af instanceof TFolder && (note = plugin.CoreApi.getFolderNote(af))) ||
        (af instanceof TFile &&
          ((note = af), plugin.CoreApi.getFolderFromNote(af)))
      ) {
        const folderNote = note;
        menu.addItem((item) =>
          item
            .setIcon("image-glyph")
            .setTitle("Set Folder Icon")
            .onClick(async () =>
              setIconField(await iscAPI.getIconFromUser(), folderNote),
            ),
        );
      }
    }),
  );
};
export default registerSetFolderIconCmd;
