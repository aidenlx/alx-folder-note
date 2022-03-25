

# [0.16.0](https://github.com/aidenlx/alx-folder-note/compare/0.15.0...0.16.0) (2022-03-25)


### Bug Fixes

* **click-handler:** fix shift selection not working on folder with note ([a4742e1](https://github.com/aidenlx/alx-folder-note/commit/a4742e1d90d6e277b48e6c6ea2e33d7e3c44f21b))


### Features

* **click handler:** add option to expand collasped folder with note while opening it ([3f98380](https://github.com/aidenlx/alx-folder-note/commit/3f9838017f5ea9a8ee5449c5b85e52f572db6522)), closes [#32](https://github.com/aidenlx/alx-folder-note/issues/32)
* **click-handler:** folder note is triggered only when click on folder title again ([f145d5a](https://github.com/aidenlx/alx-folder-note/commit/f145d5a3552a23fdf10e409ed511f4c0aee89e9e)), closes [#64](https://github.com/aidenlx/alx-folder-note/issues/64)
* support drag folder to editor to insert link ([26e6cf9](https://github.com/aidenlx/alx-folder-note/commit/26e6cf96bd51355a3c71cc7bec892d989df0c62e)), closes [#45](https://github.com/aidenlx/alx-folder-note/issues/45)# [0.15.0](https://github.com/aidenlx/alx-folder-note/compare/0.14.0...0.15.0) (2022-03-06)


### Bug Fixes

* **settings:** fix input[number] stylings ([eaeb33a](https://github.com/aidenlx/alx-folder-note/commit/eaeb33ab7648e71c05b8f79c221d5a26d9d16245))


### Features

* **fe-handler:** adjust folder title and icon style ([03a8340](https://github.com/aidenlx/alx-folder-note/commit/03a83407afdf310eeccc50a629725299f299efdd))
* **fe-patch:** support hover on folder to preview its folder note ([aa918ff](https://github.com/aidenlx/alx-folder-note/commit/aa918ff80887f6b1cae2237f5ad86fc43ba000db)), closes [#62](https://github.com/aidenlx/alx-folder-note/issues/62)
* **folder-icon:** add command and file menu option to set folder icon ([03d4ec1](https://github.com/aidenlx/alx-folder-note/commit/03d4ec1c239476d6047d093afdf237ca29c01aab))
* increase folder's collapse-indicator size on mobile ([b619b0d](https://github.com/aidenlx/alx-folder-note/commit/b619b0dbb512692383592f93562a75df152725b8))

# [0.14.0](https://github.com/aidenlx/alx-folder-note/compare/0.13.1...0.14.0) (2022-02-25)


### Bug Fixes

* **folder-icon:** fix basic styles broken in some themes; svg and emoji icons are now aligned properly ([12e28b4](https://github.com/aidenlx/alx-folder-note/commit/12e28b438dcb71304d19d3bf25d0ff5eca8a490a)), closes [#61](https://github.com/aidenlx/alx-folder-note/issues/61)


### Features

* add `is-active` class on active folder's titleEl ([eccb473](https://github.com/aidenlx/alx-folder-note/commit/eccb4737b0557a807763da711e5cd3edd5591984)), closes [#53](https://github.com/aidenlx/alx-folder-note/issues/53)
* **click-handler:** add option to disable click folder title to open folder note on mobile ([2d2bad6](https://github.com/aidenlx/alx-folder-note/commit/2d2bad6f4a84baa6ff935edf8e77d12f628da6f3)), closes [#56](https://github.com/aidenlx/alx-folder-note/issues/56) [#52](https://github.com/aidenlx/alx-folder-note/issues/52)
* **settings:** add option to configure long press delay ([745680a](https://github.com/aidenlx/alx-folder-note/commit/745680a2f64539b7678713f2f64376373b62381a)), closes [#42](https://github.com/aidenlx/alx-folder-note/issues/42)

## [0.13.1](https://github.com/aidenlx/alx-folder-note/compare/0.13.0...0.13.1) (2022-02-19)


### Bug Fixes

* fix folderv change notice keep popup after ignore it ([ca000ed](https://github.com/aidenlx/alx-folder-note/commit/ca000ed89e54e33e4a285f18dd5c427749d6b129))

# [0.13.0](https://github.com/aidenlx/alx-folder-note/compare/0.12.3...0.13.0) (2022-02-19)


### Features

* add notice about folderv changes ([22ede5e](https://github.com/aidenlx/alx-folder-note/commit/22ede5efa74b581236c56886ad179042f589d3f2))
* **settings:** add clickable notice that jump to setting tab when folder-note-core not enabled ([156d1b3](https://github.com/aidenlx/alx-folder-note/commit/156d1b3c1a607677560805d1708f0ffc02a298f0))
* **settings:** add guide to install dependencies ([8ea9769](https://github.com/aidenlx/alx-folder-note/commit/8ea9769fff29fb622f44f9ae0133bdc3a55c2f1a))


### Performance Improvements

* separate folderv code from main repo to boost loading ([73e2149](https://github.com/aidenlx/alx-folder-note/commit/73e214987de2ef767877d06127fd364fa4893f06))


### BREAKING CHANGES

* folder overview (folderv) is now an optional component that requires a dedicated plugin, go to setting tab to install it

## [0.12.3](https://github.com/aidenlx/alx-folder-note/compare/0.12.2...0.12.3) (2021-12-04)


### Bug Fixes

* **fe-handler:** remove unintended console output ([25e79db](https://github.com/aidenlx/alx-folder-note/commit/25e79db1f41748e2e01b91dfea02b14e925f9eb1))
* **folder-icon:** fix subfolder icon var polluted by parent folder's icon ([5ff6cc9](https://github.com/aidenlx/alx-folder-note/commit/5ff6cc95e6c5f6b8e18839151613b92b8e8cefe5))

## [0.12.2](https://github.com/aidenlx/alx-folder-note/compare/0.12.1...0.12.2) (2021-11-29)


### Features

* **fe-handler:** add focus on folder for file explorer ([1759c82](https://github.com/aidenlx/alx-folder-note/commit/1759c827a80b88894ca653b7478f4bfb372ebbe2))
* **fe-handler:** focused folder now auto unfold and scroll into view ([a872028](https://github.com/aidenlx/alx-folder-note/commit/a872028d05423fc18051972dfb7382c2478897c0))
* **focus:** long press (0.8s) on folder to toggle focus ([e5d96b9](https://github.com/aidenlx/alx-folder-note/commit/e5d96b9e231a0ae0a0817fc698e0a84640012c3f))
* **focus:** non-focused folders are now dimmed instead of being hidden ([529f685](https://github.com/aidenlx/alx-folder-note/commit/529f685792e524ad0828cc481924e5b68d616e18))
* **settings:** add option to disable long press to toggle focus ([a948d56](https://github.com/aidenlx/alx-folder-note/commit/a948d56ae1536844b29876ba550cac091772b208))

## [0.12.1](https://github.com/aidenlx/alx-folder-note/compare/0.12.0...0.12.1) (2021-11-27)


### Features

* **fe-handler:** add option to hide collapse indicator when folder contains only folder note ([7fa8ee8](https://github.com/aidenlx/alx-folder-note/commit/7fa8ee833acf898f781dc37aa1d7857e576897d5)), closes [#40](https://github.com/aidenlx/alx-folder-note/issues/40)

* refactor: add body.alx-folder-icons when option is enabled (ff1fa46)
* fix(initialize): fix feHanlder failed to update when workspace changes (9fe694a)
* feat(fe-handler): set folder icon in folder note (7ba11ad)
* docs(readme): update introduction (517c55e)

## [0.11.2](https://github.com/aidenlx/alx-folder-note/compare/0.11.1...0.11.2) (2021-09-15)


### Bug Fixes

* **file-card:** fix mid-click and mod-click on file card ([fe89454](https://github.com/aidenlx/alx-folder-note/commit/fe8945443ad172b7d3562a27e09ca9c2543d3e8b)), closes [#20](https://github.com/aidenlx/alx-folder-note/issues/20)
* **folderv:** folder notes are no longer included in folderv ([4b9fdf3](https://github.com/aidenlx/alx-folder-note/commit/4b9fdf368b2e6f61d72719283de124cac302bf3b))
* **initialize:** add more retrys to get FileExplorer view ([38625dc](https://github.com/aidenlx/alx-folder-note/commit/38625dc26859253996e4b190567660c85c40f721)), closes [#21](https://github.com/aidenlx/alx-folder-note/issues/21) [#12](https://github.com/aidenlx/alx-folder-note/issues/12)

## [0.11.1](https://github.com/aidenlx/alx-folder-note/compare/0.11.0...0.11.1) (2021-09-12)


### Features

* **settings:** expose log level settings of folder-note-core ([b7aecbf](https://github.com/aidenlx/alx-folder-note/commit/b7aecbfc9013f679dae9b9e17a25086bd83c68f0))

# [0.11.0](https://github.com/aidenlx/alx-folder-note/compare/0.10.0...0.11.0) (2021-09-12)


### Bug Fixes

* **fe-handler:** fix click not set on newly created folder items ([38ea6cf](https://github.com/aidenlx/alx-folder-note/commit/38ea6cfb8dd291713f5e65e68e963aec3a47012d))
* **fe-handler:** fix click not set on newly created folder items (again) ([b50b6a6](https://github.com/aidenlx/alx-folder-note/commit/b50b6a61e9b7673731950f1c291aa425566a045d))
* fix compatibility with folder-note-core v1.0.0 ([96c3105](https://github.com/aidenlx/alx-folder-note/commit/96c31053b72b45b839dcb02118dc07e22379127d))


### Features

* migrate code to folder-note-core ([29c20eb](https://github.com/aidenlx/alx-folder-note/commit/29c20ebbbfff55315c0a2fc2b551394b7a623ba5))

# [0.10.0](https://github.com/aidenlx/alx-folder-note/compare/0.9.2...0.10.0) (2021-08-12)


### Bug Fixes

* **folderv:** tippy now append to parent ([a4d57c1](https://github.com/aidenlx/alx-folder-note/commit/a4d57c1aae848fd84676755375d33da589d07a3d))


### Features

* add api support ([27e3489](https://github.com/aidenlx/alx-folder-note/commit/27e34894b2fa04c1ec7b7c50082f30dbbf7a0872))
* **folderv:** add soft link support ([4c5d33d](https://github.com/aidenlx/alx-folder-note/commit/4c5d33d82756020bcccb2bf91dda7a28e4bdccda))

## [0.9.2](https://github.com/aidenlx/alx-folder-note/compare/0.9.1...0.9.2) (2021-08-09)


### Bug Fixes

* **command:** add missing command for link-to-parent-folder; fix commands not available in preview mode ([4acd8d7](https://github.com/aidenlx/alx-folder-note/commit/4acd8d734a32ad6f17a85dd69f3fdfa6b41b502a))
* fix glob filter matched as regex; add notice for invaild options; rename sort field ([6747616](https://github.com/aidenlx/alx-folder-note/commit/67476164ec46c73c2fedd3720e9977620a72d6e9))

## [0.9.1](https://github.com/aidenlx/alx-folder-note/compare/0.9.0...0.9.1) (2021-08-09)


### Bug Fixes

* **folderv:** fix tooltip ([adc983b](https://github.com/aidenlx/alx-folder-note/commit/adc983b7bc59ea6a2ca4289504164cb58029dd2e))

# [0.9.0](https://github.com/aidenlx/alx-folder-note/compare/0.8.0...0.9.0) (2021-08-09)


### Bug Fixes

* fix css global pollution ([220f069](https://github.com/aidenlx/alx-folder-note/commit/220f06955d4053c3e1b34a0f7f87e815e5ee890d)), closes [#14](https://github.com/aidenlx/alx-folder-note/issues/14)


### Features

* add support for dark mode ([e590015](https://github.com/aidenlx/alx-folder-note/commit/e5900159f1deff7ce41c49bedfc971266db5d8e3)), closes [#15](https://github.com/aidenlx/alx-folder-note/issues/15)

# [0.8.0](https://github.com/aidenlx/alx-folder-note/compare/0.7.0...0.8.0) (2021-08-08)


### Bug Fixes

* **sort:** fix regex  not parsed correctly; fix test when regex flag set to g ([d0bdf4a](https://github.com/aidenlx/alx-folder-note/commit/d0bdf4a4d61e22383277178aa9c96b95ae1c8d1c))


### Features

* add custom title and description field name; update default settting ([33ad9f8](https://github.com/aidenlx/alx-folder-note/commit/33ad9f880d47d0cca8c52f87e0c9d9b805c4d687))
* add mid-click on folder to create new folder note ([ebefb6a](https://github.com/aidenlx/alx-folder-note/commit/ebefb6a7572ffd16afd5fe63ddbece22e4b9b3a8))

# [0.7.0](https://github.com/alx-plugins/alx-folder-note/compare/0.6.0...0.7.0) (2021-08-08)

### Bug Fixes

* **fe-handler.ts:** slience the error of no afitem found for path in waitingList ([1146529](https://github.com/alx-plugins/alx-folder-note/commit/11465298acc3ea39dfeceb8c1a816e8eb41a0bfd))
* remove monkey-around when unload ([9df247f](https://github.com/alx-plugins/alx-folder-note/commit/9df247f0448aab4394d94f6e834a65f259f8fd83))
* **vault-handler.ts:** fix folder note not update internal links when auto rename ([90922bf](https://github.com/alx-plugins/alx-folder-note/commit/90922bf115ddd89850f4d8de2df8bb060a726eb6))

### Features

* folder overview support ([44303ee](https://github.com/alx-plugins/alx-folder-note/commit/44303eeade5209649144019ced2ed51cb6fd90ac), [7da2a69](https://github.com/alx-plugins/alx-folder-note/commit/7da2a69a6c47deb09b830844cbad5ebd4e920499), [a4a128e](https://github.com/alx-plugins/alx-folder-note/commit/a4a128e78a824c03717e74ea5dc81ef7d37133f0), [9ddd1e1](https://github.com/alx-plugins/alx-folder-note/commit/9ddd1e1bd1daec0ee91c0b4b574a250e630c33d8), [d00bb3e](https://github.com/alx-plugins/alx-folder-note/commit/d00bb3e2f32f3b5346ea554ed38bed4bc2c52e1c)), closes [#6](https://github.com/alx-plugins/alx-folder-note/issues/6)

### Performance Improvements

* move debounce from vaultHandler to feHandler ([c83e125](https://github.com/alx-plugins/alx-folder-note/commit/c83e125fea78aea31c64b59c92d2a237b7bc82dd))

# [0.6.0](https://github.com/alx-plugins/alx-folder-note/compare/0.5.0...0.6.0) (2021-06-11)


### Features

* add underline to folder with note ([faeba8f](https://github.com/alx-plugins/alx-folder-note/commit/faeba8fab9d4ac78d09e83844a19ed8726266418))
* **commands.ts:** add command to link current note to parent folder ([0fe327d](https://github.com/alx-plugins/alx-folder-note/commit/0fe327dd0421c6cf30676bc072f96b016c0ca1eb))

# [0.5.0](https://github.com/alx-plugins/alx-folder-note/compare/0.4.0...0.5.0) (2021-06-10)


### Bug Fixes

* **settings.ts:** fix folder note hide fails when toggle deleteOutsideNoteWithFolder ([4eabf9b](https://github.com/alx-plugins/alx-folder-note/commit/4eabf9bb7dadd0137cbeffa22db47a4bca277837))


### Features

* add commands for folder note/folder operation ([a936d25](https://github.com/alx-plugins/alx-folder-note/commit/a936d2537c37f9a4588ad4cff1e6ca87234ee1ed))
* add debounce to vault events ([9db2a46](https://github.com/alx-plugins/alx-folder-note/commit/9db2a46fbad2b54762f33c09ae3b740fffd17af8))
* revealInFolder now jump to folder when folder note is hidden ([069b109](https://github.com/alx-plugins/alx-folder-note/commit/069b109b3596b6de4f31c6759dd0819b876d2272))


### Reverts

* remove fileCountInExplorer ([df9b68a](https://github.com/alx-plugins/alx-folder-note/commit/df9b68a6776c3755905d5f640c97ed9b31cf02f1))

# [0.4.0](https://github.com/alx-plugins/alx-folder-note/compare/0.3.0...0.4.0) (2021-05-29)


### Features

* add option to toggle fileCountInExplorer ([46688ef](https://github.com/alx-plugins/alx-folder-note/commit/46688eff1aa43bec9cb1978f0a84ad8ba9e24ae1))
* **folder-count.ts:** auto update count when file changes ([5458bdf](https://github.com/alx-plugins/alx-folder-note/commit/5458bdf9f58159944aa523600cc231675b04100c))
* add initial support for file count in explorer ([f520f66](https://github.com/alx-plugins/alx-folder-note/commit/f520f66ce7acbfcf73878e83d9c4ea9d371bd450))

# [0.3.0](https://github.com/alx-plugins/alx-folder-note/compare/0.2.0...0.3.0) (2021-05-28)


### Bug Fixes

* **valut-handler.ts:** autorename no longer rename index files ([b057bd3](https://github.com/alx-plugins/alx-folder-note/commit/b057bd3bb500327906b7bb4082e146bde923a53a))


### Features

* **vault-handler.ts:** add prompt to delete folder when folder note is removed ([fdc6c28](https://github.com/alx-plugins/alx-folder-note/commit/fdc6c28a7a2af6eace89d1d2f278d7e6d4aa93a8))
* add create-folder-for-note command ([47470ad](https://github.com/alx-plugins/alx-folder-note/commit/47470ad626a2156cf05b72686d89f9a57430deef))

# [0.2.0](https://github.com/alx-plugins/alx-folder-note/compare/0.1.1...0.2.0) (2021-05-28)


### Bug Fixes

* **find.ts:** getFolderNote() throw error when move folder content ([d60e7ad](https://github.com/alx-plugins/alx-folder-note/commit/d60e7ad6c83782251f0ebf15f519dce6af815ca0))


### Features

* **vault-handler.ts:** add prompt to comfirm deletion of folder note outside ([01b5032](https://github.com/alx-plugins/alx-folder-note/commit/01b5032be0e6b3aa4f500dcca5da76dd89bc9d0b))

## [0.1.1](https://github.com/alx-plugins/alx-folder-note/compare/0.1.0...0.1.1) (2021-05-27)


### Bug Fixes

* **vault-handler.ts:** autoRename folder note not working when hideNoteInExplorer is disabled ([6c5ca94](https://github.com/alx-plugins/alx-folder-note/commit/6c5ca94f85dd812e0954c0f5c5fe868b54bfd4b1))

# 0.1.0 (2021-05-27)


### Bug Fixes

* **click-handler.ts:** mid click not opening new leaf ([da71c1a](https://github.com/alx-plugins/alx-folder-note/commit/da71c1a1a31a4007f23413ec0d58038592221ce8))
* **note-handler.ts:** hideAll() fail to revert all hidden folder notes ([389300f](https://github.com/alx-plugins/alx-folder-note/commit/389300f1caa9c537a62f809f07f1a46ca6a61fec))
* **settings.ts:** expose hideNoteInExplorer in setting tab ([f77202c](https://github.com/alx-plugins/alx-folder-note/commit/f77202c5feba83af76a557509f4e03407e3eff81))


### Features

* **find.ts:** findFolderFromNote() now accepts path strings ([f490125](https://github.com/alx-plugins/alx-folder-note/commit/f4901255dcc9622e8f1c15511e6ef7e8159491c5))
* **settings.ts:** add live update to folderNotePref and indexName ([3e42e67](https://github.com/alx-plugins/alx-folder-note/commit/3e42e670969215020719594659f034c1154a4ca5))
* **vault-handler.ts:** folder note rename/mv now update hide state and folder ([8fec0ee](https://github.com/alx-plugins/alx-folder-note/commit/8fec0eeaff887b7f1a0e9072261d7a5e46e00d6f))
* add types for undocumented FileExplorerView ([d1d673d](https://github.com/alx-plugins/alx-folder-note/commit/d1d673dacf65458efd3b39d7992476868911e1d8))
* port core function from fork.dev ([6b24c46](https://github.com/alx-plugins/alx-folder-note/commit/6b24c4606d336fcc41ffd72fce153d6379d611ca))
* support create new folder note ([2a1026f](https://github.com/alx-plugins/alx-folder-note/commit/2a1026f36670df846394963b02ab82fc59bc2bde))
* update method to unload and load when layout is already ready ([521294b](https://github.com/alx-plugins/alx-folder-note/commit/521294bfa878697d25bc784fcc59d800038f4ff1))
* **settings.ts:** port settings from xpgo's ([f8c2e2f](https://github.com/alx-plugins/alx-folder-note/commit/f8c2e2fa9435e49cc7b333b3e61bc8f0920a7cc2))