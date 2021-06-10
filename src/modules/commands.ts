import ALxFolderNote from "main";
import { around } from "monkey-around";
import {
  FileExplorer,
  MarkdownView,
  Menu,
  Modal,
  TFile,
  TFolder,
} from "obsidian";
import { join } from "path";

import {
  findFolderFromNote,
  findFolderNote,
  getAbstractFolderNote,
} from "./find";

/** Add Make doc folder note and delete linked folder command */
export const AddOptionsForNote = (plugin: ALxFolderNote) => {
  plugin.addCommand({
    id: "make-doc-folder-note",
    name: "Make current document folder note",
    checkCallback: (checking) => {
      const view = plugin.app.workspace.activeLeaf.view as MarkdownView;
      if (checking) {
        return view instanceof MarkdownView;
      } else {
        plugin.createFolderForNote(view.file);
      }
    },
    hotkeys: [],
  });
  plugin.addCommand({
    id: "delete-linked-folder",
    name: "Delete linked folder",
    checkCallback: (checking) => {
      const view = plugin.app.workspace.activeLeaf.view as MarkdownView;
      const folderResult =
        view instanceof MarkdownView
          ? findFolderFromNote(plugin, view.file)
          : null;
      if (checking) {
        return folderResult !== null;
      } else if (folderResult) {
        plugin.app.vault.delete(folderResult, true);
      }
    },
    hotkeys: [],
  });
  plugin.addCommand({
    id: "delete-with-linked-folder",
    name: "Delete foler note with linked folder",
    checkCallback: (checking) => {
      const view = plugin.app.workspace.activeLeaf.view as MarkdownView;
      const folderResult =
        view instanceof MarkdownView
          ? findFolderFromNote(plugin, view.file)
          : null;
      if (checking) {
        return folderResult !== null;
      } else if (folderResult) {
        new DeleteWarning(plugin, view.file, folderResult).open();
      }
    },
    hotkeys: [],
  });
  plugin.registerEvent(
    plugin.app.workspace.on("file-menu", (menu, af, source, leaf) => {
      if (
        (source === "file-explorer-context-menu" ||
          source === "pane-more-options" ||
          source === "link-context-menu") &&
        af instanceof TFile &&
        af.extension === "md"
      ) {
        const folderResult = findFolderFromNote(plugin, af);
        if (!folderResult)
          menu.addItem((item) =>
            item
              .setIcon("create-new")
              .setTitle("Make Doc Folder Note")
              .onClick(() => {
                plugin.createFolderForNote(af);
                if (source === "link-context-menu")
                  plugin.app.workspace.openLinkText(af.path, "", false);
              }),
          );
        else if (source !== "link-context-menu") {
          menu.addItem((item) =>
            item
              .setIcon("trash")
              .setTitle("Delete Note with Linked Folder")
              .onClick(() => {
                new DeleteWarning(plugin, af, folderResult).open();
              }),
          );
        }
      }
    }),
  );
};

export const AddOptionsForFolder = (plugin: ALxFolderNote) => {
  const addItem = (af: TFolder, menu: Menu) => {
    const { findIn, noteBaseName } = getAbstractFolderNote(plugin, af);
    const noteResult = findFolderNote(plugin, findIn, noteBaseName);
    if (noteResult)
      menu.addItem((item) =>
        item
          .setIcon("trash")
          .setTitle("Delete Folder Note")
          .onClick(() => plugin.app.vault.delete(noteResult)),
      );
    else
      menu.addItem((item) =>
        item
          .setIcon("create-new")
          .setTitle("Create Folder Note")
          .onClick(() =>
            plugin.app.vault.create(
              join(findIn, noteBaseName + ".md"),
              plugin.getNewFolderNote(af),
            ),
          ),
      );
  };
  plugin.registerEvent(
    plugin.app.workspace.on("file-menu", (menu, af, source, leaf) => {
      if (source === "file-explorer-context-menu" && af instanceof TFolder) {
        addItem(af, menu);
      }
    }),
  );
};

export const PatchRevealInExplorer = (plugin: ALxFolderNote) => {
  const feInstance =
    // @ts-ignore
    plugin.app.internalPlugins.plugins["file-explorer"]?.instance;
  if (feInstance) {
    around(feInstance, {
      revealInFolder(next) {
        return function (this: any, ...args: any[]) {
          if (args[0] instanceof TFile && plugin.settings.hideNoteInExplorer) {
            const findResult = findFolderFromNote(plugin, args[0]);
            if (findResult) args[0] = findResult;
          }
          return next.apply(this, args);
        };
      },
    });
  }
};

class DeleteWarning extends Modal {
  target: TFile;
  targetFolder: TFolder;
  plugin: ALxFolderNote;
  constructor(plugin: ALxFolderNote, file: TFile, folder: TFolder) {
    super(plugin.app);
    this.plugin = plugin;
    this.target = file;
    this.targetFolder = folder;
  }

  get settings() {
    return this.plugin.settings;
  }
  get fileExplorer(): FileExplorer {
    if (!this.plugin.fileExplorer) {
      throw new Error("no fileExplorer");
    } else return this.plugin.fileExplorer;
  }

  deleteFolder() {
    let { contentEl } = this;
    contentEl.createEl("p", {
      text: "Warning: the entire folder and its content will be removed",
      cls: "mod-warning",
    });
    const children = this.targetFolder.children.map((v) => v.name);
    contentEl.createEl("p", {
      text:
        children.length > 5
          ? children.slice(0, 5).join(", ") + "..."
          : children.join(", "),
    });
    contentEl.createEl("p", {
      text: "Continue?",
      cls: "mod-warning",
    });
    const buttonContainer = contentEl.createDiv({
      cls: "modal-button-container",
    });
    buttonContainer.createEl(
      "button",
      { text: "Yes", cls: "mod-warning" },
      (el) =>
        el.onClickEvent(() => {
          this.app.vault.delete(this.targetFolder, true);
          this.app.vault.delete(this.target);
          this.close();
        }),
    );
    buttonContainer.createEl("button", { text: "No" }, (el) =>
      el.onClickEvent(() => {
        this.close();
      }),
    );
  }

  onOpen() {
    this.containerEl.addClass("warn");
    this.deleteFolder();
  }

  onClose() {
    let { contentEl } = this;
    contentEl.empty();
  }
}
