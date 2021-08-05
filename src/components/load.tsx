import { App, MarkdownRenderChild, parseYaml, Plugin_2 } from "obsidian";
import React from "react";
import ReactDOM from "react-dom";

import ALxFolderNote from "../fn-main";
import { FolderOverview, FolderOverviewProps, SortBy } from "./folderv";

export const FOLDERV_ID = "folderv";

export const GetFolderVHandler: (
  plugin: ALxFolderNote,
) => Parameters<Plugin_2["registerMarkdownCodeBlockProcessor"]>[1] =
  (plugin) => (source, el, ctx) => {
    let { target } = parseYaml(source);
    target =
      typeof target === "string"
        ? target
        : plugin.finder.getFolderPath(ctx.sourcePath);
    ctx.addChild(
      new FolderVRenderChild(el, {
        plugin,
        target,
        style: "grid",
        filter: [],
        sort: SortBy.name,
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
