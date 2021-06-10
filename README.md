# AidenLx's Folder Note

An complete rewrite of [xpgo/obsidian-folder-note-plugin](https://github.com/xpgo/obsidian-folder-note-plugin)

- Using Obsidian API in favor of pure dom parse
- Support hiding folder note in file explorer automatically
- Support open folder note by click on folder similar to open a file:
  - click on folder with notes will open folder note without triggering folder collapse (collapse-indicator is still available)
  - mid-click on folder open note in a new window
- Two way sync between folder and its note
  - folder notes moves with folder, even if it's outside of folder
  - move in new file that matches folder note will hide note automatically
  - move out folder not will show note again
- Live updates when changing settings

Note: without xpgo's permission, the [ccard feature](https://github.com/xpgo/obsidian-folder-note-plugin#overview-of-folder) won't be able to be ported directly, so it will take a while for this feature to get fully rewritten. But anyway, it's on the roadmap. :)

## How to use

Please visit: <https://github.com/xpgo/obsidian-folder-note-plugin#readme>
## Compatibility

The required API feature is only available for Obsidian v0.12.5+.

## Installation

### From GitHub

1. Download the Latest Release from the Releases section of the GitHub Repository
2. Put files to your vault's plugins folder: `<vault>/.obsidian/plugins/alx-folder-note`  
3. Reload Obsidian
4. If prompted about Safe Mode, you can disable safe mode and enable the plugin.
Otherwise, head to Settings, third-party plugins, make sure safe mode is off and
enable the plugin from there.

> Note: The `.obsidian` folder may be hidden. On macOS, you should be able to press `Command+Shift+Dot` to show the folder in Finder.

### From Obsidian

> Not yet available

1. Open `Settings` > `Third-party plugin`
2. Make sure Safe mode is **off**
3. Click `Browse community plugins`
4. Search for this plugin
5. Click `Install`
6. Once installed, close the community plugins window and the patch is ready to use.
