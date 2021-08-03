import "antd/dist/antd.css";

import { Col, Result, Row } from "antd";
import { TFile, TFolder } from "obsidian";
import React, { useContext, useEffect } from "react";

import { getSoftChildren } from "../modules/bread-meta";
import { FileCard } from "./file-card";
import { Context } from "./load";
import { LinkType, nameSort, NoContextError } from "./tools";

export interface FolderOverviewProps {
  target: string;
  filter?: string[];
  style?: "grid" | "list";
}

export const FolderOverview = ({ target }: FolderOverviewProps) => {
  const { plugin } = useContext(Context);

  useEffect(() => {
    if (!plugin) return;

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

  if (!plugin) return <NoContextError target={target} />;

  const folder = plugin.app.vault.getAbstractFileByPath(target);
  if (folder && folder instanceof TFolder) {
    const fileList: [file: TFile, type: LinkType][] = folder.children
      .filter((af) => af instanceof TFile)
      .map((file) => [file as TFile, LinkType.hard]);
    let folderNote;
    if ((folderNote = plugin.finder.getFolderNote(folder))) {
      for (const file of getSoftChildren(folderNote, plugin)) {
        if (fileList.every((f) => f[0].path !== file.path))
          fileList.push([file, LinkType.soft]);
      }
    }
    fileList.sort((a, b) => nameSort(a[0].name, b[0].name));

    return (
      <Row wrap gutter={[16, 16]}>
        {fileList.map((val) => (
          <Col
            key={val[0].path}
            flex="12em 1 0"
            style={{ maxHeight: "15em", maxWidth: "20em" }}
          >
            <FileCard linkType={val[1]} src={val[0]} />
          </Col>
        ))}
      </Row>
    );
  } else {
    let reason: string | null = null;
    if (!folder) reason = "No folder in path: " + target;
    else if (folder instanceof TFile) reason = "Target not folder: " + target;
    return (
      <Result status="error" title="Invaild target folder" extra={reason} />
    );
  }
};
