import "./file-explorer.less";

import { AFItem, debounce, FileExplorerView } from "obsidian";

import ALxFolderNote from "../fn-main";
import { afItemMark } from "../misc";

export default abstract class FEHandler_Base {
  longPressRegistered = new WeakSet<FileExplorerView>();
  constructor(
    public plugin: ALxFolderNote,
    public fileExplorer: FileExplorerView,
  ) {}
  get fncApi() {
    return this.plugin.CoreApi;
  }
  get app() {
    return this.plugin.app;
  }
  get files() {
    return this.fileExplorer.files;
  }
  getAfItem = (path: string): afItemMark | null =>
    this.fileExplorer.fileItems[path] ?? null;
  iterateItems = (callback: (item: AFItem) => any): void =>
    Object.values(this.fileExplorer.fileItems).forEach(callback);

  abstract queues: Record<
    string,
    {
      action: (id: string, ...args: any[]) => any;
      queue: Set<string> | Map<string, any[]>;
    }
  >;
  private debouncers = {} as Record<string, () => any>;
  private _execQueue(queueName: string) {
    const { action, queue } = this.queues[queueName];
    if (queue.size <= 0) return;
    if (queue instanceof Set) {
      queue.forEach((id) => action(id));
    } else {
      queue.forEach((args, id) => action(id, ...args));
    }
    queue.clear();
  }
  protected execQueue(queueName: string) {
    if (!Object.keys(this.queues).includes(queueName)) return;
    const debouncer =
      this.debouncers[queueName] ??
      (this.debouncers[queueName] = debounce(
        () => this._execQueue(queueName),
        200,
        true,
      ));
    debouncer();
  }
}
