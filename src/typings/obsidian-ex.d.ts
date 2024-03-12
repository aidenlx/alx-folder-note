import "obsidian";

import type getFileExplorerHandlers from "../fe-handler";

declare module "obsidian" {
  class FileExplorerView extends ItemView {
    prototype: FileExplorerView;
    fileBeingRenamed: TAbstractFile | null;
    fileItems: {
      [key: string]: AFItem;
      "/": FolderItem;
    };
    files: WeakMap<HTMLElement, TAbstractFile>;
    getViewType(): string;
    getDisplayText(): string;
    onClose(): Promise<void>;
    tree: {
      infinityScroll: HTMLDivElement;
    };
    navFileContainerEl: HTMLDivElement;
    onOpen(): Promise<void>;
    onFileClick(evt: MouseEvent, navEl: HTMLDivElement): void;
    handleFileClick(evt: MouseEvent, item: AFItem): boolean;
    createFolderDom(folder: TFolder): FolderItem;
    folderNoteUtils?: ReturnType<typeof getFileExplorerHandlers>;
    currentHoverFile: TAbstractFile | null;
    onFileMouseover(evt: MouseEvent, navTitleEl: HTMLElement): void;
    onFileMouseout(evt: MouseEvent, navTitleEl: HTMLElement): void;
    _AFN_HOVER?: TFolder;
  }

  interface ViewRegistry {
    typeByExtension: Record<string, string>;
    viewByType: Record<string, ViewCreator>;
    getViewCreatorByType(type: string): ViewCreator | undefined;
    isExtensionRegistered(ext: string): boolean;
    registerExtensions(exts: string[], type: string): void;
    registerViewWithExtensions(
      exts: string[],
      type: string,
      viewCreator: ViewCreator,
    ): void;
    unregisterExtensions(exts: string[]): void;
  }

  type AFItem = FileItem | FolderItem;

  class FileItem {
    el: HTMLDivElement;
    file: TFile;
    view: FileExplorerView;  // Starting from Obsidian 1.5.4 the .fileExplorer field was renamed to .view
    info: any;
    /**
     * @deprecated After Obsidian 1.2.0, use `selfEl` instead.
     */
    titleEl?: HTMLDivElement;
    /**
     * @deprecated After Obsidian 1.2.0, use `innerEl` instead.
     */
    titleInnerEl?: HTMLDivElement;
    selfEl: HTMLDivElement;
    innerEl: HTMLDivElement;
  }

  class FolderItem {
    el: HTMLDivElement;
    view: FileExplorerView;  // Starting from Obsidian 1.5.4 the .fileExplorer field was renamed to .view
    info: any;
    /**
     * @deprecated After Obsidian 1.2.0, use `selfEl` instead.
     */
    titleEl?: HTMLDivElement;
    /**
     * @deprecated After Obsidian 1.2.0, use `innerEl` instead.
     */
    titleInnerEl?: HTMLDivElement;
    selfEl: HTMLDivElement;
    innerEl: HTMLDivElement;
    file: TFolder;
    children: AFItem[];
    childrenEl: HTMLDivElement;
    collapseIndicatorEl: HTMLDivElement;
    collapsed: boolean;
    pusherEl: HTMLDivElement;
    setCollapsed(collapsed: boolean): Promise<void>;
    /**
     * @deprecated After Obsidian 1.2.0, use `onSelfClick` instead.
     */
    onTitleElClick?(evt: MouseEvent): any;
    onSelfClick(evt: MouseEvent): any;
  }

  interface Vault {
    exists(normalizedPath: string, sensitive?: boolean): Promise<boolean>;
  }

  class FileExplorerPlugin extends Plugin_2 {
    revealInFolder(this: any, ...args: any[]): any;
  }

  interface App {
    viewRegistry: ViewRegistry;
    plugins: {
      enabledPlugins: Set<string>;
      plugins: {
        [id: string]: any;
        "alx-folder-note-folderv"?: {
          renderFoldervSettings(containerEl: HTMLElement): void;
        };
      };
      enablePlugin(id: string): Promise<void>;
      disablePlugin(id: string): Promise<void>;
    };
    internalPlugins: {
      plugins: {
        [id: string]: any;
        ["file-explorer"]?: {
          instance: FileExplorerPlugin;
        };
      };
    };
    setting: {
      openTabById(id: string): any;
    };
  }
  interface Notice {
    noticeEl: HTMLElement;
  }
}
