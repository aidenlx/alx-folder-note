import { around } from "monkey-around";
import { MarkdownView, Menu, Modal, TFile, TFolder } from "obsidian";

import ALxFolderNote from "../fn-main";

/** Add Make doc folder note and delete linked folder command */
export const AddOptionsForNote = (plugin: ALxFolderNote) => {
  const {
    createFolderForNote,
    getFolderFromNote,
    getFolderNote,
    getFolderNotePath,
  } = plugin.finder;

  plugin.addCommand({
    id: "make-doc-folder-note",
    name: "Make current document folder note",
    checkCallback: (checking) => {
      const view = plugin.app.workspace.activeLeaf?.view as MarkdownView;
      if (checking) {
        return view instanceof MarkdownView;
      } else {
        createFolderForNote(view.file);
      }
    },
    hotkeys: [],
  });
  plugin.addCommand({
    id: "link-to-parent-folder",
    name: "Link to Parent Folder",
    checkCallback: (checking) => {
      const view = plugin.app.workspace.activeLeaf?.view as MarkdownView;
      if (checking)
        return (
          view instanceof MarkdownView &&
          view.file.parent &&
          !getFolderNote(view.file.parent)
        );
      else {
        const { path } = getFolderNotePath(view.file.parent);
        plugin.app.vault.rename(view.file, path);
      }
    },
    hotkeys: [],
  });
  plugin.addCommand({
    id: "delete-linked-folder",
    name: "Delete linked folder",
    checkCallback: (checking) => {
      const view = plugin.app.workspace.activeLeaf?.view as MarkdownView;
      const folderResult =
        view instanceof MarkdownView ? getFolderFromNote(view.file) : null;
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
    name: "Delete note and linked folder",
    checkCallback: (checking) => {
      const view = plugin.app.workspace.activeLeaf?.view as MarkdownView;
      const folderResult =
        view instanceof MarkdownView ? getFolderFromNote(view.file) : null;
      if (checking) {
        return folderResult !== null;
      } else if (folderResult) {
        new DeleteWarning(plugin, view.file, folderResult).open();
      }
    },
    hotkeys: [],
  });
  plugin.registerEvent(
    plugin.app.workspace.on("file-menu", (menu, af, source) => {
      if (
        (source === "file-explorer-context-menu" ||
          source === "pane-more-options" ||
          source === "link-context-menu") &&
        af instanceof TFile &&
        af.extension === "md"
      ) {
        const folderResult = getFolderFromNote(af);
        if (!folderResult) {
          menu.addItem((item) =>
            item
              .setIcon("create-new")
              .setTitle("Make Doc Folder Note")
              .onClick(() => {
                createFolderForNote(af);
                if (source === "link-context-menu")
                  plugin.app.workspace.openLinkText(af.path, "", false);
              }),
          );
          if (af.parent && !getFolderNote(af.parent))
            menu.addItem((item) =>
              item
                .setIcon("link")
                .setTitle("Link to Parent Folder")
                .onClick(() => {
                  const { path } = getFolderNotePath(af.parent);
                  plugin.app.vault.rename(af, path);
                }),
            );
        } else if (source !== "link-context-menu") {
          menu.addItem((item) =>
            item
              .setIcon("trash")
              .setTitle("Delete Note and Linked Folder")
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
  const { getFolderNotePath, findFolderNote } = plugin.finder;
  const addItem = (af: TFolder, menu: Menu) => {
    const { info, path } = getFolderNotePath(af);
    const noteResult = findFolderNote(...info);
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
            plugin.app.vault.create(path, plugin.getNewFolderNote(af)),
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
  const { getFolderFromNote } = plugin.finder;

  const feInstance =
    // @ts-ignore
    plugin.app.internalPlugins.plugins["file-explorer"]?.instance;
  if (feInstance) {
    const remover = around(feInstance, {
      revealInFolder: (next) => {
        return function (this: any, ...args: any[]) {
          if (args[0] instanceof TFile && plugin.settings.hideNoteInExplorer) {
            const findResult = getFolderFromNote(args[0]);
            if (findResult) args[0] = findResult;
          }
          return next.apply(this, args);
        };
      },
    });
    plugin.register(remover);
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
