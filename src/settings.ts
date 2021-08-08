import { App, debounce, Modifier, PluginSettingTab, Setting } from "obsidian";

import ALxFolderNote from "./fn-main";
import { isMac, NoteLoc } from "./misc";
import FEHandler from "./modules/fe-handler";

export const noHideMark = "alx-no-hide-note";

export interface ALxFolderNoteSettings {
  folderNotePref: NoteLoc;
  deleteOutsideNoteWithFolder: boolean;
  indexName: string;
  modifierForNewNote: Modifier;
  hideNoteInExplorer: boolean;
  autoRename: boolean;
  folderNoteTemplate: string;
  folderOverview: {
    h1AsTitleSource: boolean;
    briefMax: number;
  };
}

export const DEFAULT_SETTINGS: ALxFolderNoteSettings = {
  folderNotePref: NoteLoc.Inside,
  deleteOutsideNoteWithFolder: true,
  indexName: "_about_",
  modifierForNewNote: "Meta",
  hideNoteInExplorer: true,
  autoRename: true,
  folderNoteTemplate: "# {{FOLDER_NAME}}",
  folderOverview: {
    h1AsTitleSource: true,
    briefMax: 64,
  },
};

export class ALxFolderNoteSettingTab extends PluginSettingTab {
  plugin: ALxFolderNote;

  private get feHandler(): FEHandler {
    if (this.plugin.feHandler) return this.plugin.feHandler;
    else throw new Error("Missing feHandler");
  }

  constructor(app: App, plugin: ALxFolderNote) {
    super(app, plugin);
    this.plugin = plugin;
  }

  updateMark() {
    this.feHandler.markAll(true);
    window.setTimeout(() => {
      this.feHandler.markAll();
    }, 200);
  }

  display(): void {
    let { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Core" });
    this.setNoteLoc();
    if (this.plugin.settings.folderNotePref === NoteLoc.Index)
      this.setIndexName();
    else if (this.plugin.settings.folderNotePref === NoteLoc.Outside)
      this.setDeleteWithFolder();
    this.setTemplate();
    this.setModifier();
    this.setHide();
    if (this.plugin.settings.folderNotePref !== NoteLoc.Index)
      this.setAutoRename();
    containerEl.createEl("h2", { text: "Folder Overview" });
    this.setH1AsTitle();
    this.setBriefMax();
  }

  setDeleteWithFolder() {
    new Setting(this.containerEl)
      .setName("Delete Outside Note with Folder")
      .setDesc("Delete folder note outside when folder is deleted")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.deleteOutsideNoteWithFolder)
          .onChange(async (value) => {
            this.plugin.settings.deleteOutsideNoteWithFolder = value;
            await this.plugin.saveSettings();
          }),
      );
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
          .setValue(this.plugin.settings.folderNotePref.toString())
          .onChange(async (value: string) => {
            this.plugin.settings.folderNotePref = +value;
            this.updateMark();
            await this.plugin.saveSettings();
            this.display();
          });
      });
  }
  setIndexName() {
    new Setting(this.containerEl)
      .setName("Name for Index File")
      .setDesc("Set the note name to be recognized as index file for folders")
      .addText((text) => {
        const onChange = async (value: string) => {
          this.plugin.settings.indexName = value;
          this.updateMark();
          await this.plugin.saveSettings();
        };
        text
          .setValue(this.plugin.settings.indexName)
          .onChange(debounce(onChange, 500, true));
      });
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
          descEl.appendText("{{FOLDER_NAME}} {{FOLDER_PATH}}");
        }),
      )
      .addTextArea((text) => {
        const onChange = async (value: string) => {
          this.plugin.settings.folderNoteTemplate = value;
          await this.plugin.saveSettings();
        };
        text
          .setValue(this.plugin.settings.folderNoteTemplate)
          .onChange(debounce(onChange, 500, true));
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

        const options = isMac() ? macOSOpts : windowsOpts;

        dropDown
          .addOptions(options)
          .setValue(this.plugin.settings.modifierForNewNote.toString())
          .onChange(async (value: string) => {
            this.plugin.settings.modifierForNewNote = value as Modifier;
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
            document.body.toggleClass(noHideMark, !value);
            await this.plugin.saveSettings();
          }),
      );
  }
  setAutoRename() {
    new Setting(this.containerEl)
      .setName("Auto Sync")
      .setDesc("Keep name and location of folder note and folder in sync")
      .addToggle((toggle) => {
        toggle.setValue(this.plugin.settings.autoRename);
        toggle.onChange(async (value) => {
          this.plugin.settings.autoRename = value;
          await this.plugin.saveSettings();
        });
      });
  }

  setBriefMax() {
    const isPositiveInteger = (number: string) =>
      Number.isInteger(+number) && +number > 0;
    const { settings } = this.plugin;
    new Setting(this.containerEl)
      .setName("Maximum Brief Length")
      .setDesc(
        "Maximum length of brief generated from 1st paragraph of notes when not description field is set in frontmatter",
      )
      .addText((text) => {
        const save = debounce(
          async (value: string) => {
            settings.folderOverview.briefMax = +value;
            await this.plugin.saveSettings();
          },
          500,
          true,
        );
        text
          .setValue(settings.folderOverview.briefMax.toString())
          .onChange(async (value: string) => {
            text.inputEl.toggleClass("incorrect", !isPositiveInteger(value));
            if (isPositiveInteger(value)) save(value);
          });
      });
  }
  setH1AsTitle() {
    const { settings } = this.plugin;
    new Setting(this.containerEl)
      .setName("Use First Heading 1 as File Title")
      .setDesc(
        "Applied when title field is not set in the frontmatter, fallback to filename when no Heading 1 found",
      )
      .addToggle((toggle) =>
        toggle
          .setValue(settings.folderOverview.h1AsTitleSource)
          .onChange(async (value) => {
            settings.folderOverview.h1AsTitleSource = value;
            await this.plugin.saveSettings();
          }),
      );
  }
}
