import { Plugin } from "obsidian";
import {
  _MyPlugin_Settings,
  DEFAULT_SETTINGS,
  _MyPlugin_SettingTab,
} from "settings";
import "./main.css";

export default class _MyPlugin_ extends Plugin {
  settings: _MyPlugin_Settings = DEFAULT_SETTINGS;

  async onload() {
    console.log("loading plugin");

    await this.loadSettings();

    this.addSettingTab(new _MyPlugin_SettingTab(this.app, this));
  }

  onunload() {
    console.log("unloading plugin");
  }

  async loadSettings() {
    this.settings = { ...this.settings, ...(await this.loadData()) };
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
