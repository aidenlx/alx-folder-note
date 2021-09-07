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
        : plugin.CoreApi.getFolderPath(ctx.sourcePath, false);
    // Sort Option
    if (!sort) {
      plugin.notify("sort", null);
      sort = SortBy.name;
    } else if (!Object.values(SortBy).includes(sort)) {
      plugin.notify(
        "sort",
        `invaild sort option: ${JSON.stringify(
          sort,
        )}\nfallback to A-Z name sort`,
      );
      sort = SortBy.name;
    } else plugin.notify("sort", null);
    // Filter Option
    try {
      filter = getFilter(filter);
    } catch (e) {
      plugin.notify(
        "filter",
        `invaild filter option: ${JSON.stringify(filter)}\n` +
          (e as any)?.toString(),
      );
      filter = null;
    } finally {
      plugin.notify("filter", null);
    }
    ctx.addChild(
      new FolderVRenderChild(el, {
        plugin,
        target,
        style: "card",
        filter,
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
