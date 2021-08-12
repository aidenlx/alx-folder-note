import "tippy.js/dist/tippy.css";
import "./tippy.css";

import Tippy from "@tippyjs/react";
import { Card, Empty, Image, Skeleton, Space, Tag } from "antd";
import Paragraph from "antd/lib/typography/Paragraph";
import assertNever from "assert-never";
import {
  App,
  FileStats,
  moment,
  SectionCache,
  TAbstractFile,
  TFile,
} from "obsidian";
import { dirname } from "path";
import bytes from "pretty-bytes";
import React, { ReactNode, useEffect, useMemo, useState } from "react";

import ALxFolderNote from "../fn-main";
import {
  FileType,
  getFileType,
  getIcon,
  LinkType,
  ObInternalLink,
  ObTag,
} from "./tools";

interface FileCardProps {
  plugin: ALxFolderNote;
  src: string;
  linkType: LinkType;
  cover?: ReactNode;
}

interface MdBrief {
  type: FileType.md;
  content: string | null;
}
interface ImgBrief {
  type: FileType.img;
  src: string;
}

type BriefInfo = MdBrief | ImgBrief;

export const FileCard = ({ plugin, src, cover, linkType }: FileCardProps) => {
  const { vault, metadataCache, workspace } = plugin.app;
  const { folderOverview: settings } = plugin.settings;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const file = useMemo(() => vault.getAbstractFileByPath(src), [src]);

  if (!file) throw new Error("Unable to find file/folder at path: " + src);
  else if (!(file instanceof TFile)) throw new Error("Folder not supported");

  const [title, setTitle] = useState(getTitle(file, plugin));

  const [stat, setStat] = useState(file.stat);
  const [brief, setBrief] = useState<BriefInfo | null>(null);
  const [tags, setTags] = useState<Set<string>>(getTags(file, plugin.app));

  const fileIcon = useMemo(
    () => getIcon(getFileType(file.extension)),
    [file.extension],
  );

  useEffect(() => {
    getBriefInfo(file, plugin).then((info) => setBrief(info));
    const handleFileChange = async (af: TAbstractFile, oldPath?: string) => {
      const titleSetup = () => setTitle(getTitle(file, plugin));
      if (af.path !== file.path) return;
      // handle vault.on(rename)
      if (oldPath) {
        if (dirname(oldPath) === dirname(af.path)) titleSetup();
        // if file being moved, do nothing
        else return;
      } else {
        titleSetup();
        setBrief(await getBriefInfo(file, plugin));
        setTags(getTags(file, plugin.app));
      }
      setStat(file.stat);
    };

    plugin.registerEvent(metadataCache.on("changed", handleFileChange));
    plugin.registerEvent(vault.on("rename", handleFileChange));
    return () => {
      metadataCache.off("changed", handleFileChange);
      vault.off("rename", handleFileChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  const handleClick = (e: React.MouseEvent) => {
    if (e.target instanceof Element && e.target.matches("a.tag, span.ant-tag"))
      return;
    else if ([0, 1].includes(e.button))
      workspace.openLinkText(file.path, "", false);
  };
  return (
    <Card
      title={<ObInternalLink linktext={file.path}>{title}</ObInternalLink>}
      cover={cover}
      extra={
        <Tippy
          theme="obsidian"
          appendTo="parent"
          content={<FileInfo stat={stat} type={linkType} />}
        >
          {fileIcon}
        </Tippy>
      }
      size="small"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
      bodyStyle={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
      }}
      hoverable
      onClick={handleClick}
      onAuxClick={handleClick}
    >
      <FileContent info={brief} tags={tags} />
    </Card>
  );
};

/** Get title from file content */
const getTitle = (file: TFile, plugin: ALxFolderNote) => {
  const { metadataCache } = plugin.app;
  const { titleField, h1AsTitleSource: useH1 } = plugin.settings.folderOverview;
  const cache = metadataCache.getFileCache(file);
  if (!cache) console.log("no meta for file %o, fallback to filename", file);
  else {
    const { frontmatter, headings } = cache;
    if (frontmatter && typeof frontmatter[titleField] === "string")
      return frontmatter[titleField];
    let h1;
    if (useH1 && headings && (h1 = headings.find((h) => h.level === 1)))
      return h1.heading;
  }
  return file.basename;
};

const getDocBrief = async (
  file: TFile,
  plugin: ALxFolderNote,
): Promise<string | null> => {
  const { metadataCache, vault } = plugin.app;
  const { briefMax, descField } = plugin.settings.folderOverview;
  const get1stParagraph = async (
    sections: SectionCache[] | undefined,
  ): Promise<string | null> => {
    if (!sections) return null;
    const result = sections.find((sec) => sec.type === "paragraph");
    if (!result) return null;
    const { start, end } = result.position;
    let doc = await vault.cachedRead(file);
    return doc.substring(start.offset, end.offset).substring(0, briefMax);
  };

  const cache = metadataCache.getFileCache(file);
  if (!cache) console.log("no meta for file %o, fallback to null", file);
  else {
    const { frontmatter, sections } = cache;
    if (frontmatter && typeof frontmatter[descField] === "string")
      return frontmatter[descField];
    else return await get1stParagraph(sections);
  }
  return null;
};

const FileContent = ({
  info,
  tags,
}: {
  info: BriefInfo | null;
  tags: Set<string>;
}): JSX.Element => {
  if (!info)
    return <Empty description={false} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  switch (info.type) {
    case FileType.md: {
      const rows = tags.size > 0 ? 3 : 4;
      return (
        <>
          <div style={{ flexGrow: 1 }}>
            <Skeleton
              loading={!info.content}
              paragraph={{ rows }}
              title={false}
            >
              <Paragraph ellipsis={{ rows }}>{info.content}</Paragraph>
            </Skeleton>
          </div>
          <Tags tags={tags} />
        </>
      );
    }
    case FileType.img:
      return (
        <Image
          height={100}
          style={{ objectFit: "contain" }}
          src={info.src}
          preview={false}
        />
      );
    default:
      assertNever(info);
  }
};

const Tags = ({ tags }: { tags: Set<string> }) =>
  tags.size > 0 ? (
    <Space size={[0, 8]} wrap>
      {[...tags].map((tag) => (
        <Tag key={tag}>
          <ObTag tag={tag} />
        </Tag>
      ))}
    </Space>
  ) : null;

const getBriefInfo = async (
  file: TFile,
  plugin: ALxFolderNote,
): Promise<BriefInfo | null> => {
  const type = getFileType(file.extension);
  switch (type) {
    case FileType.md: {
      const content = await getDocBrief(file, plugin);
      return { type, content };
    }
    case FileType.img:
      return { type, src: plugin.app.vault.getResourcePath(file) };
    case FileType.pdf:
    case FileType.video:
    case FileType.audio:
    case FileType.other:
      return null;
    default:
      assertNever(type);
  }
};

const getTags = (file: TFile, app: App): Set<string> => {
  const cache = app.metadataCache.getFileCache(file);
  if (!cache) {
    console.log("no meta for file %o, fallback to null", file);
    return new Set();
  } else return new Set(cache.tags?.map((v) => v.tag));
};

const FileInfo = ({
  stat: { ctime, mtime, size },
  type,
}: {
  stat: FileStats;
  type: LinkType;
}) => (
  <div>
    <div>Last Modified: {moment(mtime).format("YYYY-MM-DD HH:mm")}</div>
    <div>Created: {moment(ctime).format("YYYY-MM-DD HH:mm")}</div>
    <div>
      {type === LinkType.hard ? "Hard" : "Soft"} Link; Size: {bytes(size)}
    </div>
  </div>
);
