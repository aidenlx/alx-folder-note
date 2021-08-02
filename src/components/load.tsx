import { App, MarkdownRenderChild, Plugin_2 } from "obsidian";
import React from "react";
import ReactDOM from "react-dom";

import ALxFolderNote from "../fn-main";
import { ALxFolderNoteSettings, DEFAULT_SETTINGS } from "../settings";
import { FolderOverview, FolderOverviewProps } from "./folderv";

export type FVContext = {
  plugin?: ALxFolderNote;
  settings: ALxFolderNoteSettings["folderOverview"];
};
export const Context = React.createContext<FVContext>({
  settings: DEFAULT_SETTINGS.folderOverview,
});

export const FOLDERV_ID = "folderv";

export const GetFolderVHandler: (
  plugin: ALxFolderNote,
) => Parameters<Plugin_2["registerMarkdownCodeBlockProcessor"]>[1] =
  (plugin) => (source, el, ctx) => {
    const target = plugin.finder.getFolderPath(ctx.sourcePath);
    ctx.addChild(new FolderVRenderChild(el, { target }, plugin));
  };

class FolderVRenderChild extends MarkdownRenderChild {
  constructor(
    containerEl: HTMLElement,
    props: FolderOverviewProps,
    plugin: ALxFolderNote,
  ) {
    super(containerEl);
    const contextVal: FVContext = {
      plugin,
      settings: plugin.settings.folderOverview,
    };
    ReactDOM.render(
      <Context.Provider value={contextVal}>
        <FolderOverview {...props} />
      </Context.Provider>,
      this.containerEl,
    );
  }

  unload() {
    ReactDOM.unmountComponentAtNode(this.containerEl);
    super.unload();
  }
}
