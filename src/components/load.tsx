import { MarkdownRenderChild, parseYaml } from "obsidian";
import React from "react";
import ReactDOM from "react-dom";

import ALxFolderNote from "../fn-main";
import { FolderOverview, FolderOverviewProps } from "./folderv";
import { SortBy } from "./sort";

export const FOLDERV_ID = "folderv";

export const GetFolderVHandler: (
  plugin: ALxFolderNote,
) => Parameters<ALxFolderNote["registerMarkdownCodeBlockProcessor"]>[1] =
  (plugin) => (source, el, ctx) => {
    let { target, sort } = parseYaml(source) ?? {};
    target =
      typeof target === "string"
        ? target
        : plugin.finder.getFolderPath(ctx.sourcePath);
    // @ts-ignore
    sort = (SortBy[sort] as SortBy | undefined) ?? SortBy.name;
    ctx.addChild(
      new FolderVRenderChild(el, {
        plugin,
        target,
        style: "grid",
        filter: [],
        sort,
      }),
    );
  };

class FolderVRenderChild extends MarkdownRenderChild {
  constructor(containerEl: HTMLElement, props: FolderOverviewProps) {
    super(containerEl);
    ReactDOM.render(<FolderOverview {...props} />, this.containerEl);
  }

  unload() {
    ReactDOM.unmountComponentAtNode(this.containerEl);
    super.unload();
  }
}
