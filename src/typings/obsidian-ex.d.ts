import "obsidian";

import FolderNoteAPI from "@aidenlx/folder-note-core";
import { ChangeInfo, RelationResolverAPI } from "@aidenlx/relation-resolver";

declare module "obsidian" {
  class FileExplorer extends View {
    fileItems: { [key: string]: AFItem };
    files: WeakMap<HTMLDivElement, TAbstractFile>;
    getViewType(): string;
    getDisplayText(): string;
  }

  type AFItem = FolderItem | FileItem;

  interface FileItem {
    el: HTMLDivElement;
    file: TFile;
    fileExplorer: FileExplorer;
    info: any;
    titleEl: HTMLDivElement;
    titleInnerEl: HTMLDivElement;
  }

  interface FolderItem {
    el: HTMLDivElement;
    fileExplorer: FileExplorer;
    info: any;
    titleEl: HTMLDivElement;
    titleInnerEl: HTMLDivElement;
    file: TFolder;
    children: AFItem[];
    childrenEl: HTMLDivElement;
    collapseIndicatorEl: HTMLDivElement;
    collapsed: boolean;
    pusherEl: HTMLDivElement;
  }

  interface Vault {
    exists(normalizedPath: string, sensitive?: boolean): Promise<boolean>;
    on(
      name: "folder-note:create",
      callback: (note: TFile, folder: TFolder) => any,
    ): EventRef;
    on(
      name: "folder-note:rename",
      callback: (
        note: [file: TFile, oldPath: string],
        folder: [folder: TFolder, oldPath: string],
      ) => any,
    ): EventRef;
    on(
      name: "folder-note:delete",
      callback: (note: TFile, folder: TFolder) => any,
    ): EventRef;
    on(name: "folder-note:cfg-changed", callback: () => any): EventRef;
  }

  interface App {
    plugins: {
      enabledPlugins: Set<string>;
      plugins: {
        [id: string]: any;
        ["relation-resolver"]?: {
          api: RelationResolverAPI;
        };
        ["folder-note-core"]?: {
          api: FolderNoteAPI;
        };
      };
    };
    internalPlugins: {
      plugins: {
        [id: string]: any;
        ["file-explorer"]?: {
          instance: {
            revealInFolder(this: any, ...args: any[]): any;
          };
        };
      };
    };
  }

  interface MetadataCache {
    on(
      name: "relation:changed",
      callback: (info: ChangeInfo, ref: RelationResolverAPI) => any,
      ctx?: any,
    ): EventRef;
    on(
      name: "relation:resolved",
      callback: (ref: RelationResolverAPI) => any,
      ctx?: any,
    ): EventRef;
  }
}
