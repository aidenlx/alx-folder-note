# AidenLx's Folder Note

Add description, summary and more info to folders with folder notes.

alx-folder-note is a maintained, completely rewritten, and improved folder note plugin that covers all core features of the original [folder note plugin](https://github.com/xpgo/obsidian-folder-note-plugin) (Special thanks to [xpgo](https://github.com/xpgo)) (except folder overview), with enhanced file explorer patches and lots of QoL improvements, aiming to make the folder with note work as seamless as native files.)

![demo](https://user-images.githubusercontent.com/31102694/128635308-0a58279e-8bf0-4608-9330-fe11180953dd.png)

Note:

1. Starting from v0.13.0, Folder Overview (folderv) has become an optional component, you can go to the Folder Overview section of the setting tab to install it
2. Starting from v0.11.0, this plugin require [folder-note-core](https://github.com/aidenlx/folder-note-core) to work properly. For old user, check [here](https://github.com/aidenlx/alx-folder-note/wiki/migrate-from-v0.10.0-and-lower) for migration guide.

## Intro

- [create folder note](https://github.com/aidenlx/alx-folder-note/wiki/create-folder-note) easily, with [mulitple preferences](https://github.com/aidenlx/alx-folder-note/wiki/folder-note-pref) and [template support](https://github.com/aidenlx/alx-folder-note/wiki/core-settings#template)
- folder and folder note working as one
  - [click on folder in file explorer to open folder note](https://github.com/aidenlx/alx-folder-note/wiki/open-folder-note-from-folder)
  - [folder and linked note synced as one](https://github.com/aidenlx/alx-folder-note/wiki/core-settings#auto-rename): change folder name from folder note; folder note moves with your folder
  - [folder note hidden from file explorer](https://github.com/aidenlx/alx-folder-note/wiki/core-settings#hide-note-in-explorer)
  - [reveal linked folder in file explorer](https://github.com/aidenlx/alx-folder-note/wiki/core-settings#hide-note-in-explorer)<br><img width="300px" src="https://user-images.githubusercontent.com/31102694/128694966-6517df3b-8994-408d-bf6c-49a5ea16b7be.gif"/>
  - [delete folder within folder note](https://github.com/aidenlx/alx-folder-note/wiki/delete-folder-from-folder-note)
- [create folder overview](https://github.com/aidenlx/alx-folder-note/wiki/folder-overview) with codeblock `folderv` (Optional)
  - view all files within folder with brief cards
  - specify title and description in frontmatter (with [customizable field name](https://github.com/aidenlx/alx-folder-note/wiki/folderv-settings#field-names))
  - [fetch title from h1](https://github.com/aidenlx/alx-folder-note/wiki/folderv-settings#h1-as-title-source) if title not specified
  - [filter files](https://github.com/aidenlx/alx-folder-note/wiki/folderv-options#filter) with regex/glob
  - [sort files](https://github.com/aidenlx/alx-folder-note/wiki/folderv-options#sort) by name/create time/last modified time

More to come:

- [ ] `folderv`: show [children specified in dataview/frontmatter fields](https://github.com/SkepticMystic/breadcrumbs/wiki/Relationships---Basics) (works with [relation-resolver plugin](https://github.com/aidenlx/relation-resolver))
- [ ] `folderv`: list view
- [ ] [folder icon in file explorer](https://github.com/aidenlx/alx-folder-note/issues/11)

## How to use

Check [wiki](https://github.com/aidenlx/alx-folder-note/wiki) for more details

## Compatibility

The required API feature is only available for Obsidian v0.12.5+.

## Installation

Note: Starting from v0.11.0, this plugin require [folder-note-core](https://github.com/aidenlx/folder-note-core) to work properly, which is also available on community plugins list.

### From Obsidian

1. Open `Settings` > `Third-party plugin`
2. Make sure Safe mode is **off**
3. Click `Browse community plugins`
4. Search for this plugin
5. Click `Install`
6. Once installed, close the community plugins window and the plugin is ready to use.

### From GitHub

1. Download the Latest Release from the Releases section of the GitHub Repository
2. Put files to your vault's plugins folder: `<vault>/.obsidian/plugins/alx-folder-note`
3. Reload Obsidian
4. If prompted about Safe Mode, you can disable safe mode and enable the plugin.
   Otherwise, head to Settings, third-party plugins, make sure safe mode is off and
   enable the plugin from there.

> Note: The `.obsidian` folder may be hidden. On macOS, you should be able to press `Command+Shift+Dot` to show the folder in Finder.
