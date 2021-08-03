import "obsidian";

import { BreadMeta } from "../modules/bread-meta";
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

  interface MetadataCache {
    on(name: "initialized", callback: () => any, ctx?: any): EventRef;
    on(name: "finished", callback: () => any, ctx?: any): EventRef;
    on(
      name: "bread-meta-changed",
      callback: (filePath: string, breadMeta: BreadMeta) => any,
      ctx?: any,
    ): EventRef;
    on(
      name: "bread-meta-resolved",
      callback: (breadMeta: BreadMeta) => any,
      ctx?: any,
    ): EventRef;
  }
}
