import ALxFolderNote from "main";
import { PluginSettingTab, App, Setting } from "obsidian";

export enum NoteLoc {
  Index,
  Inside,
  Outside,
}

export enum Modifier {
  /** translates to `Meta` on macOS and `Ctrl` otherwise */
  Mod,
  Ctrl,
  Meta,
  Shift,
  Alt,
}

export interface ALxFolderNoteSettings {
  folderNoteLoc: NoteLoc;
  indexName: string;
  modifierForNewNote: Modifier;
  hideNoteInExplorer: boolean;
  autoRename: boolean;
  folderNoteTemplate: string;
}

export const DEFAULT_SETTINGS: ALxFolderNoteSettings = {
  folderNoteLoc: NoteLoc.Inside,
  indexName: "_about_",
  modifierForNewNote: Modifier.Meta,
  hideNoteInExplorer: true,
  autoRename: true,
  folderNoteTemplate: "# {{FOLDER_NAME}}",
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
    let { containerEl, plugin } = this;
    containerEl.empty();

    this.setNoteLoc();
    if (this.plugin.settings.folderNoteLoc === NoteLoc.Index)
      this.setIndexName();
    this.setTemplate();
    this.setModifier();
    if (this.plugin.settings.folderNoteLoc !== NoteLoc.Index)
      this.setAutoRename();
  }

  setNoteLoc() {
    new Setting(this.containerEl)
      .setName("Preference for Note File Location")
      .setDesc("Select how you would like the folder note to be placed")
      .addDropdown((dropDown) => {
        const options: Record<NoteLoc, string> = {
          [NoteLoc.Index]: "Inside Folder, Index File",
          [NoteLoc.Inside]: "Inside Folder, With Same Name",
          [NoteLoc.Outside]: "Outside Folder, With Same Name",
        };

        dropDown
          .addOptions(options)
          .setValue(this.plugin.settings.folderNoteLoc.toString())
          .onChange(async (value: string) => {
            this.plugin.settings.folderNoteLoc = +value;
            await this.plugin.saveSettings();
          });
      });
  }
  setIndexName() {
    new Setting(this.containerEl)
      .setName("Name for Index File")
      .setDesc("Set the note name to be recognized as index file for folders")
      .addText((text) =>
        text
          .setValue(this.plugin.settings.indexName)
          .onChange(async (value) => {
            this.plugin.settings.indexName = value;
            await this.plugin.saveSettings();
          }),
      );
  }
  setTemplate() {
    new Setting(this.containerEl)
      .setName("Folder Note Template")
      .setDesc(
        createFragment((descEl) => {
          descEl.appendText("The template used to generate new folder note.");
          descEl.appendChild(document.createElement("br"));
          descEl.appendText("Supported placeholders:");
          descEl.appendChild(document.createElement("br"));
          descEl.appendText("");
        }),
      )
      .addTextArea((text) => {
        text
          .setValue(this.plugin.settings.folderNoteTemplate)
          .onChange(async (value) => {
            try {
              this.plugin.settings.folderNoteTemplate = value;
              await this.plugin.saveSettings();
            } catch (e) {
              return false;
            }
          });
        text.inputEl.rows = 8;
        text.inputEl.cols = 50;
      });
  }
  setModifier() {
    new Setting(this.containerEl)
      .setName("Modifier for New Note")
      .setDesc("Choose a modifier to click folders with to create folder notes")
      .addDropdown((dropDown) => {
        const windowsOpts: Record<Modifier, string> = {
          [Modifier.Mod]: "Ctrl(Cmd in macOS)",
          [Modifier.Ctrl]: "Ctrl(Ctrl in macOS)",
          [Modifier.Meta]: "⊞ Win",
          [Modifier.Shift]: "Shift",
          [Modifier.Alt]: "Alt",
        };
        const macOSOpts: Record<Modifier, string> = {
          [Modifier.Mod]: "⌘ Cmd",
          [Modifier.Ctrl]: "⌃ Control",
          [Modifier.Meta]: "⌘ Cmd",
          [Modifier.Shift]: "⇧ Shift",
          [Modifier.Alt]: "⌥ Option",
        };

        const isMac = navigator.userAgent.includes("Macintosh");
        const options = isMac ? macOSOpts : windowsOpts;

        dropDown
          .addOptions(options)
          .setValue(this.plugin.settings.modifierForNewNote.toString())
          .onChange(async (value: string) => {
            this.plugin.settings.modifierForNewNote = +value;
            await this.plugin.saveSettings();
          });
      });
  }
  setHide() {
    new Setting(this.containerEl)
      .setName("Hide Folder Note")
      .setDesc("Hide folder note files from file explorer")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.hideNoteInExplorer)
          .onChange(async (value) => {
            this.plugin.settings.hideNoteInExplorer = value;
            await this.plugin.saveSettings();
          }),
      );
  }
  setAutoRename() {
    new Setting(this.containerEl)
      .setName("Auto Rename")
      .setDesc("Keep folder note and folder in sync")
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.autoRename);
        toggle.onChange(async (value) => {
          this.plugin.settings.autoRename = value;
          await this.plugin.saveSettings();
        });
      });
  }
}
