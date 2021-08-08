import "antd/dist/antd.css";

import { Col, Result, Row } from "antd";
import { OrderedMap, Set } from "immutable";
import { TFile, TFolder } from "obsidian";
import { basename } from "path";
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
    const { vault } = plugin.app,
      handleChildrenChange = () => {};

    plugin.registerEvent(vault.on("create", handleChildrenChange));
    plugin.registerEvent(vault.on("delete", handleChildrenChange));
    // only handle move
    plugin.registerEvent(vault.on("rename", handleChildrenChange));
    return () => {
      vault.off("create", handleChildrenChange);
      vault.off("delete", handleChildrenChange);
      vault.off("rename", handleChildrenChange);
    };
  });
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
