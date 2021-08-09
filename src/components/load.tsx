import "./antd-light.less";
import "./antd-dark.less";

import { MarkdownRenderChild, parseYaml } from "obsidian";
import React from "react";
import ReactDOM from "react-dom";

import ALxFolderNote from "../fn-main";
import { getFilter } from "./filter";
import { FolderOverview, FolderOverviewProps } from "./folderv";
import { SortBy } from "./sort";

export const FOLDERV_ID = "folderv";

export const GetFolderVHandler: (
  plugin: ALxFolderNote,
) => Parameters<ALxFolderNote["registerMarkdownCodeBlockProcessor"]>[1] =
  (plugin) => (source, el, ctx) => {
    let { target, sort, filter } = parseYaml(source) ?? {};
    target =
      typeof target === "string"
        ? target
        : plugin.finder.getFolderPath(ctx.sourcePath);
    sort = Object.values(SortBy).includes(sort) ? sort : SortBy.name;
    ctx.addChild(
      new FolderVRenderChild(el, {
        plugin,
        target,
        style: "card",
        filter: getFilter(filter),
        sort,
      }),
    );
  };

class FolderVRenderChild extends MarkdownRenderChild {
  constructor(containerEl: HTMLElement, props: FolderOverviewProps) {
    super(containerEl);
    containerEl.addClass("alx-folderv");
    ReactDOM.render(<FolderOverview {...props} />, this.containerEl);
  }

  unload() {
    ReactDOM.unmountComponentAtNode(this.containerEl);
    super.unload();
  }
}
