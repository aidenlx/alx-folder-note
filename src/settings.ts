import _MyPlugin_ from "main";
import { PluginSettingTab, App, Setting } from "obsidian";

export interface _MyPlugin_Settings {
  hello: boolean;
}

export const DEFAULT_SETTINGS: _MyPlugin_Settings = {
  hello: true,
};

type option = {
  k: keyof _MyPlugin_Settings;
  name: string;
  desc: string | DocumentFragment;
};

export class _MyPlugin_SettingTab extends PluginSettingTab {
  plugin: _MyPlugin_;

  constructor(app: App, plugin: _MyPlugin_) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    for (const o of this.options) {
      this.setOption(o);
    }
  }

  setOption(this: _MyPlugin_SettingTab, { k, name, desc }: option) {
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
