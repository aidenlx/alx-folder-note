import { TFile, TFolder } from "obsidian";

export default interface FolderNoteAPI {
  getFolderFromNote: (note: TFile | string) => TFolder | null;
  getFolderNote: (
    ...args: [path: string, folder: TFolder] | [folder: TFolder]
  ) => TFile | null;
}
