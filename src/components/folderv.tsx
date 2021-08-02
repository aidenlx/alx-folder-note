import "antd/dist/antd.css";

import { Col, Result, Row } from "antd";
import { TFile, TFolder } from "obsidian";
import React, { useContext, useEffect } from "react";

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
    const fileList = folder.children
      .sort((a, b) => nameSort(a.name, b.name))
      .filter((af) => af instanceof TFile) as TFile[];
    return (
      <Row wrap gutter={[16, 16]}>
        {fileList.map((file) => (
          <Col
            key={file.path}
            flex="12em 1 0"
            style={{ maxHeight: "15em", maxWidth: "20em" }}
          >
            <FileCard linkType={LinkType.hard} src={file} />
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
