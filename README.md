> [!IMPORTANT]
> 
> This is a patched version of the Obsidian plugin [aidenlx/alx-folder-note](https://github.com/aidenlx/alx-folder-note)
>
> The fix addresses the problem reported under: https://github.com/aidenlx/alx-folder-note/issues/134
>
> The source of the problem are breaking changes introduced in Obsidian 1.5.4 in File Explorer.
> They basically renamed the internal field FileExplorerView.fileExplorer to .view thus impacting
> the (backward) compatibility with this plugin.
> 
> My plugin [SebastianMC/obsidian-custom-sort](https://github.com/SebastianMC/obsidian-custom-sort) was also affected.
> I invested my time to track back via reverse engineering that breaking change.
> In result I was able to apply relevant fix to my plugin.
> This forked repo of [aidenlx/alx-folder-note](https://github.com/aidenlx/alx-folder-note) applies exactly the same fix to the plugin.
> 
> If you want to install the patched version there are two basic options:
> - install from this (forked) repository via Obsidian BRAT plugin, or
> - download this repository and build it by yourself:
>   - command: `npm install`
>   - command: `npm run build`
>   - then copy the `build/main.js` to your vault folder, overriding the `main.js` of the original plugin
>

# AidenLx's Folder Note

Add description, summary and more info to folders with folder notes.

alx-folder-note is a maintained, completely rewritten, and improved folder note plugin that covers all core features of the original [folder note plugin](https://github.com/xpgo/obsidian-folder-note-plugin)) (except folder overview), with enhanced file explorer patches and lots of QoL improvements, aiming to make the folder with note work as seamless as native files.)

Special thanks to [xpgo](https://github.com/xpgo), the author of original [folder note plugin](https://github.com/xpgo/obsidian-folder-note-plugin)!

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
- folder focus mode: right-click on folder in file explorer and select Toggle Focus can dim other folders and files outside of selected folder, select option again to revert ![CleanShot_2021-11-29_at_18 30 53](https://user-images.githubusercontent.com/31102694/166448049-aea0457a-d19f-4b29-8f7c-b66b5bd26629.gif)
    - you can also long press with mouse on the folder name in file explorer to toggle folder focus (disabled by default, desktop only) 
- [folder icon in file explorer](https://github.com/aidenlx/alx-folder-note/issues/11)
More to come:

- [ ] `folderv`: show [children specified in dataview/frontmatter fields](https://github.com/SkepticMystic/breadcrumbs/wiki/Relationships---Basics) (works with [relation-resolver plugin](https://github.com/aidenlx/relation-resolver))
- [ ] `folderv`: list view

## How to use

Check [wiki](https://github.com/aidenlx/alx-folder-note/wiki) for more details

## Compatibility

The required API feature is only available for Obsidian v0.14.8+.

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
