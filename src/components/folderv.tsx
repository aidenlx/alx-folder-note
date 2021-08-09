import { Col, Result, Row } from "antd";
import { OrderedMap, Set } from "immutable";
import { TAbstractFile, TFile, TFolder } from "obsidian";
import { dirname } from "path";
import React, { useEffect, useState } from "react";

import ALxFolderNote from "../fn-main";
import { FileCard } from "./file-card";
import { Filter } from "./filter";
import { getSorted, SortBy } from "./sort";
import { FileInfo, LinkType, Path_Types } from "./tools";
export interface FolderOverviewProps {
  plugin: ALxFolderNote;
  /** should be path, not linktext */
  target: string;
  filter?: Filter;
  style: "card" | "list";
  sort: SortBy;
}

const getChildren = (
  folderPath: string,
  plugin: ALxFolderNote,
  filter?: Filter,
): Path_Types | null => {
  const folder = plugin.app.vault.getAbstractFileByPath(folderPath);
  const internalFilter = filter
    ? (af: TAbstractFile): af is TFile => af instanceof TFile && filter(af.name)
    : (af: TAbstractFile): af is TFile => af instanceof TFile;
  if (folder instanceof TFolder) {
    return OrderedMap<string, FileInfo>().withMutations((map) =>
      folder.children.forEach(
        (file) =>
          internalFilter(file) && map.set(file.path, FileInfo({ file })),
      ),
    );
    // let folderNote = plugin.finder.getFolderNote(af);
    // if (folderNote) {
    //   const softChildren = plugin.relationCache.getChildrenWithTypes(
    //     folderNote.path,
    //   );
    //   if (softChildren) children = children.concat(softChildren);
    // }
  } else return null;
};

export const FolderOverview = ({
  target,
  plugin,
  sort,
  filter,
}: FolderOverviewProps) => {
  const [children, setChildren] = useState<Path_Types | null>(
    getSorted(getChildren(target, plugin, filter), sort),
  );

  useEffect(() => {
    const { vault } = plugin.app;

    const moveIn = (af: TAbstractFile, type: LinkType) =>
      af instanceof TFile &&
      setChildren((prev) => {
        if (!prev) return prev;
        // @ts-ignore
        return prev.update(af.path, (info) => {
          if (info) return info.update("types", (types) => types.add(type));
          else return FileInfo({ file: af, types: Set([type]) });
        });
      });
    const moveOut = (path: string, type: LinkType) =>
      // @ts-ignore
      setChildren((prev) => {
        if (!prev) return prev;
        const info = prev.get(path);
        if (info && info.types.has(type)) {
          if (info.types.size <= 1) return prev.delete(path);
          else return info.update("types", (types) => types.delete(type));
        }
      });

    const handleVaultChange = (af: TAbstractFile, oldPath?: string) => {
      if (oldPath) {
        // rename
        const parentBefore = dirname(oldPath),
          parentAfter = dirname(af.path);
        if (parentAfter === parentBefore) return;
        // when moved, not rename
        if (parentAfter === target) moveIn(af, LinkType.hard);
        else if (parentBefore === target) moveOut(oldPath, LinkType.hard);
      } else {
        const parentPath = dirname(af.path);
        if (parentPath !== target) return;
        // create
        if (af.parent) moveIn(af, LinkType.hard);
        // delete
        else moveOut(af.path, LinkType.hard);
      }
    };

    plugin.registerEvent(vault.on("create", handleVaultChange));
    plugin.registerEvent(vault.on("delete", handleVaultChange));
    // only handle move
    plugin.registerEvent(vault.on("rename", handleVaultChange));
    // plugin.registerEvent(
    //   metadataCache.on("rr:changed", handleMetaChange),
    // );
    return () => {
      vault.off("create", handleVaultChange);
      vault.off("delete", handleVaultChange);
      vault.off("rename", handleVaultChange);
      // metadataCache.off("rr:changed", handleMetaChange);
    };
  }, [plugin, target]);
  if (children) {
    return (
      <Row wrap gutter={[16, 16]}>
        {children
          .entrySeq()
          .map(([path, { types }]) => (
            <Col
              key={path}
              flex="12em 1 0"
              style={{ maxHeight: "15em", maxWidth: "20em" }}
            >
              <FileCard linkType={types.first()} src={path} plugin={plugin} />
            </Col>
          ))
          .toArray()}
      </Row>
    );
  } else {
    let reason: string | null = null;
    const af = plugin.app.vault.getAbstractFileByPath(target);
    if (!af) reason = "No folder/file in path: " + target;
    else if (af instanceof TFile) reason = "Target not folder: " + target;
    return (
      <Result status="error" title="Invaild target folder" extra={reason} />
    );
  }
};
