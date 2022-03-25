import "obsidian";

import { around } from "monkey-around";
import { DragManager, TFile, TFolder } from "obsidian";

import type ALxFolderNote from "./fn-main";

declare module "obsidian" {
  interface App {
    dragManager: DragManager;
  }
  interface DragInfo {
    source: string | undefined;
    type: string;
    icon: string;
    title: string;
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
    dragFile(evt: DragEvent, file: TFile, source?: string): DragFolderInfo;
    dragFiles(evt: DragEvent, files: TFile[], source?: string): DragFilesInfo;
    dragFolder(
      evt: DragEvent,
      folder: TFolder,
      source?: string,
    ): DragFolderInfo;
  }
}

const PatchDragManager = (plugin: ALxFolderNote) => {
  const { getFolderNote } = plugin.CoreApi;

  plugin.register(
    around(plugin.app.dragManager.constructor.prototype as DragManager, {
      dragFolder: (next) =>
        function (this: DragManager, evt, folder, source, ...args) {
          const fallback = () => next.call(this, evt, folder, source, ...args);
          try {
            let note = getFolderNote(folder);
            if (note) {
              return this.dragFile(evt, note, source);
            } else {
              return fallback();
            }
          } catch (error) {
            console.error(error);
            return fallback();
          }
        },
      // dragFiles: (next) =>
      //   function (this: DragManager, evt, files, source, ...args) {
      //     const fallback = () => next.call(this, evt, files, source, ...args);
      //     try {
      //       let dragedFiles = files as (TFile | number)[];
      //       let pathFolderNoteMap: Map<string, TFile> = new Map();
      //       let index = -1;
      //       // find all folder with note,
      //       // save folder note in map,
      //       // and replace them with index to map sequence
      //       for (let i = 0; i < files.length; i++) {
      //         const af = dragedFiles[i];
      //         let note;
      //         if (af instanceof TFolder && (note = getFolderNote(af))) {
      //           pathFolderNoteMap.set(note.path, note) && index++;
      //           dragedFiles[i] = index;
      //         }
      //       }
      //       if (index < 0) return fallback();
      //       // filter out duplicate folder note
      //       dragedFiles = dragedFiles.filter(
      //         (af) => typeof af === "number" || !pathFolderNoteMap.has(af.path),
      //       );
      //       // put folder note back to original sequence
      //       const folderNotes = [...pathFolderNoteMap.values()];
      //       for (let i = 0; i < dragedFiles.length; i++) {
      //         const file = dragedFiles[i];
      //         if (typeof file === "number")
      //           dragedFiles[file] = folderNotes[file];
      //       }
      //     } catch (error) {
      //       fallback();
      //     }
      //     return fallback();
      //   },
    }),
  );
};
export default PatchDragManager;
