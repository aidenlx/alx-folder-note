import "obsidian";

import RelationCache from "../modules/relation-cache";

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
  }

  interface MetadataCache {
    on(name: "initialized", callback: () => any, ctx?: any): EventRef;
    on(name: "finished", callback: () => any, ctx?: any): EventRef;
    on(
      name: "relation-changed",
      callback: (file: TFile, cache: RelationCache) => any,
      ctx?: any,
    ): EventRef;
    on(
      name: "relation-resolved",
      callback: (cache: RelationCache) => any,
      ctx?: any,
    ): EventRef;
    initialized: boolean;
  }
}
