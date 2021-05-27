import ALxFolderNote from "main";
import { PluginSettingTab, App, Setting } from "obsidian";

export interface ALxFolderNoteSettings {
  hello: boolean;
}

export const DEFAULT_SETTINGS: ALxFolderNoteSettings = {
  hello: true,
};

type option = {
  k: keyof ALxFolderNoteSettings;
  name: string;
  desc: string | DocumentFragment;
};

export class ALxFolderNoteSettingTab extends PluginSettingTab {
  plugin: ALxFolderNote;

  constructor(app: App, plugin: ALxFolderNote) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    for (const o of this.options) {
      this.setOption(o);
    }
  }

  setOption(this: ALxFolderNoteSettingTab, { k, name, desc }: option) {
    new Setting(this.containerEl)
      .setName(name)
      .setDesc(desc)
      .addToggle((toggle) =>
        toggle.setValue(this.plugin.settings[k]).onChange(async (value) => {
          this.plugin.settings[k] = value;
          this.plugin.saveData(this.plugin.settings);
          this.display();
        }),
      );
  }

  options: option[] = [
    {
      k: "hello",
      name: "Hello",
      desc: (function () {
        const descEl = document.createDocumentFragment();
        descEl.appendText("Line 1");
        descEl.appendChild(document.createElement("br"));
        descEl.appendText("Line 2");
        return descEl;
      })(),
    },
  ];
}
