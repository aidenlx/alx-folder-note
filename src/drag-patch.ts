import "obsidian";

import { around } from "monkey-around";
import {
  ClipboardManager,
  DragManager,
  MarkdownView,
  Platform,
  TFolder,
  WorkspaceLeaf,
} from "obsidian";

import type ALxFolderNote from "./fn-main";

declare global {
  var i18next: any;
}
declare module "obsidian" {
  interface App {
    dragManager: DragManager;
    getObsidianUrl(file: TFile): string;
  }
  interface DragInfo {
    source?: string;
    type: string;
    icon: string;
    title: string;
    file?: TFolder | TFile;
  }
  interface DragFolderInfo extends DragInfo {
    type: "folder";
    file: TFolder;
  }
  interface DragFileInfo extends DragInfo {
    type: "file";
    file: TFile;
  }
  interface DragFilesInfo extends DragInfo {
    type: "files";
    files: TFile[];
  }
  class DragManager {
    draggable: DragInfo | null;
    setAction: (action: string) => any;
    dragFile(evt: DragEvent, file: TFile, source?: string): DragFolderInfo;
    dragFiles(evt: DragEvent, files: TFile[], source?: string): DragFilesInfo;
    dragFolder(
      evt: DragEvent,
      folder: TFolder,
      source?: string,
    ): DragFolderInfo;
    // handleDrop: (
    //   el: HTMLElement,
    //   handler: (
    //     evt: DragEvent,
    //     dragable: DragInfo,
    //     draging: boolean,
    //   ) => {
    //     action: string;
    //     dropEffect: string;
    //     hoverEl?: HTMLElement;
    //     hoverClass?: string;
    //   },
    //   arg0: boolean,
    // ) => void;
  }
  interface MarkdownView {
    editMode?: MarkdownEditView;
    sourceMode?: MarkdownEditView;
  }
  interface MarkdownEditView {
    clipboardManager: ClipboardManager;
  }
  class ClipboardManager {
    app: App;
    handleDrop: (evt: DragEvent) => boolean;
    handleDragOver: (evt: DragEvent) => void;
  }
}

const HD = {
  none: [],
  copy: ["copy"],
  copyLink: ["copy", "link"],
  copyMove: ["copy", "move"],
  link: ["link"],
  linkMove: ["link", "move"],
  move: ["move"],
  all: ["copy", "link", "move"],
  uninitialized: [],
} as const;
function VD(e: DragEvent, t: DataTransfer["dropEffect"]) {
  t &&
    (function (e, t) {
      if ("none" === t) return !0;
      let n = HD[e.dataTransfer!.effectAllowed];
      return !!n && (n as any).contains(t);
    })(e, t) &&
    (e.dataTransfer!.dropEffect = t);
}

const PatchDragManager = (plugin: ALxFolderNote) => {
  const { getFolderNote } = plugin.CoreApi;

  const view = new MarkdownView(new (WorkspaceLeaf as any)(plugin.app)),
    editMode = view.editMode ?? view.sourceMode;

  if (!editMode)
    throw new Error("Failed to patch clipboard manager: no edit view found");

  plugin.register(
    around(app.dragManager.constructor.prototype as DragManager, {
      dragFolder: (next) =>
        function (this: DragManager, evt, folder, source, ...args) {
          let note;
          if ((note = getFolderNote(folder))) {
            const url = app.getObsidianUrl(note);
            evt.dataTransfer!.setData("text/plain", url);
            evt.dataTransfer!.setData("text/uri-list", url);
          }
          return next.call(this, evt, folder, source, ...args);
        },
    }),
  );
  plugin.register(
    around(
      editMode.clipboardManager.constructor.prototype as ClipboardManager,
      {
        handleDragOver: (next) =>
          function (this: ClipboardManager, evt, ...args) {
            const { draggable } = this.app.dragManager;
            if (
              draggable &&
              !(Platform.isMacOS ? evt.shiftKey : evt.altKey) &&
              draggable.file instanceof TFolder &&
              getFolderNote(draggable.file)
            ) {
              // evt.preventDefault();
              VD(evt, "link");
              this.app.dragManager.setAction(
                i18next.t("interface.drag-and-drop.insert-link-here"),
              );
            } else {
              next.call(this, evt, ...args);
            }
          },
        handleDrop: (next) =>
          function (this: ClipboardManager, evt, ...args) {
            const fallback = () => next.call(this, evt, ...args);
            const { draggable } = plugin.app.dragManager;
            let note;
            if (
              draggable?.type === "folder" &&
              draggable.file instanceof TFolder &&
              (note = getFolderNote(draggable.file))
            ) {
              draggable.file = note;
              draggable.type = "file";
            }
            return fallback();
          },
      },
    ),
  );
};
export default PatchDragManager;
