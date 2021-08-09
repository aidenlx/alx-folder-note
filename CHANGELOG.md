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

