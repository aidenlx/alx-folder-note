import "antd/dist/antd.css";

import { Col, Result, Row } from "antd";
import { OrderedMap, Set } from "immutable";
import { TAbstractFile, TFile, TFolder } from "obsidian";
import { basename, dirname } from "path";
import React, { useEffect, useState } from "react";

import ALxFolderNote from "../fn-main";
import { FileCard } from "./file-card";
import { LinkType } from "./tools";

export enum SortBy {
  name,
  nameR,
  mtime,
  mtimeR,
  ctime,
  ctimR,
}
export interface FolderOverviewProps {
  plugin: ALxFolderNote;
  /** should be path, not linktext */
  target: string;
  filter: string[];
  style: "grid" | "list";
  sort: SortBy;
}

type Path_Types = OrderedMap<string, Set<LinkType>>;
const getChildren = (
  folder: string,
  plugin: ALxFolderNote,
): Path_Types | null => {
  const af = plugin.app.vault.getAbstractFileByPath(folder);
  if (af instanceof TFolder) {
    let children: Path_Types = OrderedMap(
      af.children
        .filter((af): af is TFile => af instanceof TFile)
        .map((f) => [f.path, Set<LinkType>([LinkType.hard])]),
    );
    // let folderNote = plugin.finder.getFolderNote(af);
    // if (folderNote) {
    //   const softChildren = plugin.relationCache.getChildrenWithTypes(
    //     folderNote.path,
    //   );
    //   if (softChildren) children = children.concat(softChildren);
    // }
    return children;
  } else return null;
};

export const FolderOverview = ({ target, plugin }: FolderOverviewProps) => {
  const [children, setChildren] = useState<Path_Types | null>(
    getChildren(target, plugin)?.sortBy<string>((_v, path) => basename(path)) ??
      null,
  );

  useEffect(() => {
    const { vault } = plugin.app;

    const moveIn = (af: TAbstractFile, type: LinkType) =>
      af instanceof TFile &&
      setChildren(
        (prev) =>
          prev?.update(af.path, (types) =>
            types ? types.add(type) : Set([type]),
          ) ?? prev,
      );
    const moveOut = (path: string) =>
      setChildren((prev) => prev?.delete(path) ?? null);

    const handleVaultChange = (af: TAbstractFile, oldPath?: string) => {
      if (oldPath) {
        // rename
        const parentBefore = dirname(oldPath),
          parentAfter = dirname(af.path);
        if (parentAfter === parentBefore) return;
        // when moved, not rename
        if (parentAfter === target) moveIn(af, LinkType.hard);
        else if (parentBefore === target) moveOut(oldPath);
      } else {
        const parentPath = dirname(af.path);
        if (parentPath !== target) return;
        // create
        if (af.parent) moveIn(af, LinkType.hard);
        // delete
        else moveOut(af.path);
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
          .map(([path, types]) => (
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
