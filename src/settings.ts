import { getApi } from "@aidenlx/obsidian-icon-shortcodes";
import { App, Modifier, Platform, PluginSettingTab, Setting } from "obsidian";

import ALxFolderNote from "./fn-main";
import { NoteLoc } from "./misc";

export const noHideNoteMark = "alx-no-hide-note";
export const folderIconMark = "alx-folder-icons";

export interface ALxFolderNoteSettings {
  modifierForNewNote: Modifier;
  hideNoteInExplorer: boolean;
  hideCollapseIndicator: boolean;
  longPressFocus: boolean;
  folderIcon: boolean;
  folderNotePref: NoteLoc | null;
  deleteOutsideNoteWithFolder: boolean | null;
  indexName: string | null;
  autoRename: boolean | null;
  folderNoteTemplate: string | null;
}

export const DEFAULT_SETTINGS: ALxFolderNoteSettings = {
  modifierForNewNote: "Mod",
  hideNoteInExplorer: true,
  hideCollapseIndicator: false,
  longPressFocus: false,
  folderIcon: true,
  folderNotePref: null,
  deleteOutsideNoteWithFolder: null,
  indexName: null,
  autoRename: null,
  folderNoteTemplate: null,
};

const old = [
  "folderNotePref",
  "deleteOutsideNoteWithFolder",
  "indexName",
  "autoRename",
  "folderNoteTemplate",
] as const;

export class ALxFolderNoteSettingTab extends PluginSettingTab {
  plugin: ALxFolderNote;

  constructor(app: App, plugin: ALxFolderNote) {
    super(app, plugin);
    this.plugin = plugin;
  }

  checkMigrated(): boolean {
    return old.every((key) => this.plugin.settings[key] === null);
  }

  display(): void {
    let { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl).setHeading().setName("Core");
    if (this.checkMigrated()) {
      this.plugin.CoreApi.renderCoreSettings(containerEl);
    } else this.setMigrate();
    this.setFolderIcon();
    this.setModifier();
    this.setHide();
    this.setFocus();

    new Setting(containerEl).setHeading().setName("Debug");
    this.plugin.CoreApi.renderLogLevel(containerEl);
  }

  setMigrate() {
    new Setting(this.containerEl)
      .setName("Migrate settings to Folder Note Core")
      .setDesc(
        "Some settings has not been migrated to Folder Note Core, " +
          "click Migrate to migrate old config " +
          "or Cancel to use config in Folder Note Core in favor of old config",
      )
      .addButton((cb) =>
        cb.setButtonText("Migrate").onClick(async () => {
          const toImport = old.reduce(
            (obj, k) => ((obj[k] = this.plugin.settings[k] ?? undefined), obj),
            {} as any,
          );
          this.plugin.CoreApi.importSettings(toImport);
          old.forEach((k) => ((this.plugin.settings as any)[k] = null));
          await this.plugin.saveSettings();
          this.display();
        }),
      )
      .addButton((cb) =>
        cb.setButtonText("Cancel").onClick(async () => {
          old.forEach((k) => ((this.plugin.settings as any)[k] = null));
          await this.plugin.saveSettings();
          this.display();
        }),
      );
  }

  setModifier = () => {
    new Setting(this.containerEl)
      .setName("Modifier for New Note")
      .setDesc("Choose a modifier to click folders with to create folder notes")
      .addDropdown((dropDown) => {
        const windowsOpts: Record<Modifier, string> = {
          Mod: "Ctrl (Cmd in macOS)",
          Ctrl: "Ctrl (Ctrl in macOS)",
          Meta: "⊞ Win",
          Shift: "Shift",
          Alt: "Alt",
        };
        const macOSOpts: Record<Modifier, string> = {
          Mod: "⌘ Cmd (Ctrl)",
          Ctrl: "⌃ Control",
          Meta: "⌘ Cmd (Win)",
          Shift: "⇧ Shift",
          Alt: "⌥ Option",
        };

        const options = Platform.isMacOS ? macOSOpts : windowsOpts;

        dropDown
          .addOptions(options)
          .setValue(this.plugin.settings.modifierForNewNote.toString())
          .onChange(async (value: string) => {
            this.plugin.settings.modifierForNewNote = value as Modifier;
            await this.plugin.saveSettings();
          });
      });
  };

  setHide() {
    new Setting(this.containerEl)
      .setName("Hide Folder Note")
      .setDesc("Hide folder note files from file explorer")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.hideNoteInExplorer)
          .onChange(async (value) => {
            this.plugin.settings.hideNoteInExplorer = value;
            document.body.toggleClass(noHideNoteMark, !value);
            await this.plugin.saveSettings();
          }),
      );
    new Setting(this.containerEl)
      .setName("Hide Collapse Indicator")
      .setDesc(
        "Hide collapse indicator when folder contains only folder note, reload obsidian to take effects",
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.hideCollapseIndicator)
          .onChange(async (value) => {
            this.plugin.settings.hideCollapseIndicator = value;
            await this.plugin.saveSettings();
          }),
      );
  }
  setFolderIcon() {
    new Setting(this.containerEl)
      .setName("Set Folder Icon in Folder Notes")
      .setDesc(
        createFragment((el) => {
          el.appendText(
            "Set `icon` field with icon shortcode in frontmatter of foler note to specify linked folder's icon",
          );
          el.createEl("br");

          el.createEl("a", {
            href: "https://github.com/aidenlx/obsidian-icon-shortcodes",
            text: "Icon Shortcodes v0.5.1+",
          });
          el.appendText(" Required. ");
          if (!getApi(this.plugin)) el.appendText("(Currently not enabled)");
          el.createEl("br");

          el.appendText("Restart obsidian to take effects");
        }),
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.folderIcon)
          .onChange(async (value) => {
            this.plugin.settings.folderIcon = value;
            document.body.toggleClass(folderIconMark, value);
            await this.plugin.saveSettings();
          }),
      );
  }
  setFocus() {
    new Setting(this.containerEl)
      .setName("Long Press on Folder to Focus")
      .setDesc(
        "Long press with mouse on folder name inside file explorer to focus the folder. " +
          "Only work on Desktop, reload obsidian to take effects",
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.longPressFocus)
          .onChange(async (value) => {
            this.plugin.settings.longPressFocus = value;
            await this.plugin.saveSettings();
          }),
      );
  }
}
