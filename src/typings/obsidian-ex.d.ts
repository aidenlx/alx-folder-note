import "obsidian";

declare module "obsidian" {
  class FileExplorer extends View {
    fileItems: { [key: string]: AFItem };
    files: WeakMap<HTMLDivElement, TAbstractFile>;
    getViewType(): string;
    getDisplayText(): string;
    onClose(): Promise<void>;
    dom: {
      infinityScroll: HTMLDivElement;
      navFileContainerEl: HTMLDivElement;
    };
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
    setCollapsed(collapsed: boolean): Promise<void>;
  }

  interface Vault {
    exists(normalizedPath: string, sensitive?: boolean): Promise<boolean>;
  }

  interface App {
    plugins: {
      enabledPlugins: Set<string>;
      plugins: {
        [id: string]: any;
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
}
