import { Card, Empty, Image, Skeleton, Space, Tag, Tooltip } from "antd";
import Paragraph from "antd/lib/typography/Paragraph";
import assertNever from "assert-never";
import { App, SectionCache, TAbstractFile, TFile } from "obsidian";
import { dirname } from "path";
import React, {
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Context } from "./load";
import {
  FileType,
  getFileType,
  getIcon,
  LinkType,
  ObInternalLink,
  ObTag,
  statToText,
} from "./tools";

interface FileCardProps {
  src: TFile;
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

export const FileCard = ({ src, cover, linkType }: FileCardProps) => {
  const { plugin, settings } = useContext(Context);
  if (!plugin) throw new Error("No plugin available in context");
  const { vault, metadataCache, workspace } = plugin.app;

  const [title, setTitle] = useState(
    getTitle(src, settings.h1AsTitleSource, plugin.app),
  );

  const [stat, setStat] = useState(src.stat);
  const [brief, setBrief] = useState<BriefInfo | null>(null);
  const [tags, setTags] = useState<Set<string>>(getTags(src, plugin.app));

  const fileIcon = useMemo(
      () => getIcon(getFileType(src.extension)),
      [src.extension],
    ),
    // linkIcon = useMemo(() => linkType, [linkType]),
    statText = useMemo(() => statToText(stat), [stat]);

  useEffect(() => {
    getBriefInfo(src, plugin.app).then((info) => setBrief(info));
    const handleFileChange = async (af: TAbstractFile, oldPath?: string) => {
      const titleSetup = () =>
        setTitle(getTitle(src, settings.h1AsTitleSource, plugin.app));
      if (af.path !== src.path) return;
      // handle vault.on(rename)
      if (oldPath) {
        if (dirname(oldPath) === dirname(af.path)) titleSetup();
        // if file being moved, do nothing
        else return;
      } else {
        titleSetup();
        setBrief(await getBriefInfo(src, plugin.app));
        setTags(getTags(src, plugin.app));
      }
      setStat(src.stat);
    };

    plugin.registerEvent(metadataCache.on("changed", handleFileChange));
    plugin.registerEvent(vault.on("rename", handleFileChange));
    return () => {
      metadataCache.off("changed", handleFileChange);
      vault.off("rename", handleFileChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const handleClick = (e: React.MouseEvent) => {
    if (e.target instanceof Element && e.target.matches("a.tag, span.ant-tag"))
      return;
    else if ([0, 1].includes(e.button))
      workspace.openLinkText(src.path, "", false);
  };
  return (
    <Card
      title={<ObInternalLink linktext={src.path}>{title}</ObInternalLink>}
      cover={cover}
      extra={<Tooltip title={statText}>{fileIcon}</Tooltip>}
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
const getTitle = (file: TFile, h1AsTitleSource: boolean, app: App) => {
  const cache = app.metadataCache.getFileCache(file);
  if (!cache) console.log("no meta for file %o, fallback to filename", file);
  else {
    if (typeof cache.frontmatter?.title === "string")
      return cache.frontmatter.title;
    let h1;
    if (
      h1AsTitleSource &&
      cache.headings &&
      (h1 = cache.headings.find((h) => h.level === 1))
    )
      return h1.heading;
  }
  return file.basename;
};

const getDocBrief = async (file: TFile, app: App): Promise<string | null> => {
  const { metadataCache, vault } = app;
  const get1stParagraph = async (sections: SectionCache[] | undefined) => {
    if (!sections) return null;
    const result = sections.find((sec) => sec.type === "paragraph");
    if (!result) return null;
    const { start, end } = result.position;
    let doc = await vault.cachedRead(file);
    return doc.substring(start.offset, end.offset);
  };

  const cache = metadataCache.getFileCache(file);
  if (!cache) console.log("no meta for file %o, fallback to null", file);
  else {
    const { frontmatter, sections } = cache;
    if (frontmatter?.description) return frontmatter.description;
    return await get1stParagraph(sections);
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
  app: App,
): Promise<BriefInfo | null> => {
  const type = getFileType(file.extension);
  switch (type) {
    case FileType.md: {
      const content = await getDocBrief(file, app);
      return { type, content };
    }
    case FileType.img:
      return { type, src: app.vault.getResourcePath(file) };
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