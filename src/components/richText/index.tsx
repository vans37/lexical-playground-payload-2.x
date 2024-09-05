/* eslint-disable @next/next/no-img-element */
import type { SerializedLinkNode, SerializedUploadNode } from '@payloadcms/richtext-lexical'
import type { SerializedHeadingNode, SerializedQuoteNode } from '@lexical/rich-text'
import type { SerializedImageNode } from '../../payload/lexical/features/Images/nodes/ImageNode'
import type { SerializedListItemNode, SerializedListNode } from '@lexical/list'
import type { Media } from '../../payload-types'
import {
  cn,
  removeForwardSlash,
  replaceOriginWithServerUrl,
  styleStringToObject,
} from '../../lib/utils'
import type { SerializedLayoutContainerNode } from '../../payload/lexical/features/Layout/nodes/LayoutContainerNode'
import type { SerializedYouTubeNode } from '../../payload/lexical/features/Youtube/nodes/YouTubeNode'
import type SerializedTextNode from 'lexical'
import type {
  SerializedTableCellNode,
  SerializedTableNode,
  SerializedTableRowNode,
} from '@lexical/table'
import { Table, TableBody, TableCell, TableRow } from '../../components/ui/table'
import type { ReactElement } from 'react'
import React from 'react'
import CollapsibleContainer from './CollapsibleContainer.client'
import type { SerializedCollapsibleContainerNode } from '../../payload/lexical/features/Collapsible/nodes/CollapsibleContainerNode'
import type { CollapsibleTitleNode } from '../../payload/lexical/features/Collapsible/nodes/CollapsibleTitleNode'
import type { CollapsibleContentNode } from '../../payload/lexical/features/Collapsible/nodes/CollapsibleContentNode'
import { CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { ChevronsUpDown } from 'lucide-react'
import { Button } from '../ui/button'
import type { SerializedGalleryNode } from '../../payload/lexical/features/ImageGallery/nodes/GalleryNode'
import type { SerializedGalleryImageNode } from '../../payload/lexical/features/ImageGallery/nodes/GalleryImageNode'
import type { LayoutType, Photo } from 'react-photo-album'
import PhotoAlbumClient from './PhotoAlbum.client'
import type { SerializedLexicalNodeWithParent } from '@payloadcms/richtext-lexical/dist/field/features/converters/html/converter/types'
import type { SerializedGalleryHandlerNode } from '../../payload/lexical/features/ImageGallery/nodes/GalleryHandlerNode'
import { v4 as uuid } from 'uuid'

const nodeFormats = ['start', 'left', 'center', 'right', 'end', 'justify']

//https://github.com/Livog/Payload.3.0.Starter/blob/main/src/components/LexicalContent/index.tsx
export const IS_BOLD = 1
export const IS_ITALIC = 1 << 1
export const IS_STRIKETHROUGH = 1 << 2
export const IS_UNDERLINE = 1 << 3
export const IS_CODE = 1 << 4
export const IS_SUBSCRIPT = 1 << 5
export const IS_SUPERSCRIPT = 1 << 6
export const IS_HIGHLIGHT = 1 << 7

const populateChildren = (
  node: any,
  args: {
    isCheckList: boolean
  } = {
    isCheckList: false,
  },
) => {
  if (node && node.children && node.children.length > 0) {
    return node.children.map(node => elementsTree(node, args))
  } else {
    return null
  }
}

const renderParagraph = (node: any): React.ReactNode => {
  const childrenContent = populateChildren(node)
  if (nodeFormats.includes(node.format)) {
    return (
      <div
        className="my-[1.2em]"
        style={{
          textAlign: node.format,
          ...(node.indent ? { paddingInlineStart: 'calc(40px)' } : null),
        }}
      >
        {childrenContent}
      </div>
    )
  } else {
    //if children empty => line break, somehow it is not serialized in editor
    if (!childrenContent) {
      return <p />
    }
    return <div className="my-[1.2em]">{childrenContent}</div>
  }
}

const renderText = (node: SerializedTextNode.SerializedTextNode): React.ReactNode => {
  const text = node.text
  const style = styleStringToObject(node.style)

  const TextComponent = ({ children, format }) => {
    const formatFunctions: { [key: number]: (child: ReactElement | string) => ReactElement } = {
      [IS_BOLD]: child => <strong style={style}>{child}</strong>,
      [IS_ITALIC]: child => <em style={style}>{child}</em>,
      [IS_STRIKETHROUGH]: child => <del style={style}>{child}</del>,
      [IS_UNDERLINE]: child => <u style={style}>{child}</u>,
      [IS_CODE]: child => <code style={style}>{child}</code>,
      [IS_SUBSCRIPT]: child => <sub style={style}>{child}</sub>,
      [IS_SUPERSCRIPT]: child => <sup style={style}>{child}</sup>,
    }

    const formattedText = Object.entries(formatFunctions).reduce(
      (formattedText, [key, formatter]) => {
        return format & Number(key) ? formatter(formattedText) : formattedText
      },
      children,
    )

    return <React.Fragment>{formattedText}</React.Fragment>
  }
  return (
    <TextComponent format={node.format}>
      <span style={style}>{text}</span>
    </TextComponent>
  )
}

const renderImage = (node: SerializedImageNode): React.ReactNode => {
  let imgSrc = node.src

  if (node.id && node.isWebUploadable) {
    imgSrc = replaceOriginWithServerUrl(removeForwardSlash(node.src))
  }

  if (!imgSrc) {
    imgSrc = `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/not_found.png`
  }

  if (node?.showCaption && node?.caption?.length > 0) {
    return (
      <figure>
        <img alt={node.altText} src={imgSrc} className="inline-block h-auto max-w-full p-1" />
        <figcaption>{node.caption}</figcaption>
      </figure>
    )
  } else {
    return <img alt={node.altText} src={imgSrc} className="inline-block h-auto max-w-full p-1" />
  }
}

const renderLayoutContainer = (node: SerializedLayoutContainerNode) => {
  const childrenContent = populateChildren(node)

  return (
    <div className="grid" style={{ gridTemplateColumns: node.templateColumns }}>
      {childrenContent}
    </div>
  )
}

const renderLayoutItem = (node: SerializedLayoutContainerNode) => {
  const childrenContent = populateChildren(node)
  return <div>{childrenContent}</div>
}

const renderUpload = (node: SerializedUploadNode) => {
  const media = node.value as unknown as Media
  const mimeType = media?.mimeType
  if (mimeType.startsWith('image')) {
    const url = replaceOriginWithServerUrl(removeForwardSlash(media?.url))
    const sizes = media?.sizes

    if (!sizes) {
      return <img src={url} alt={media.alt} className="inline-block h-auto max-w-full p-1" />
    }

    /**
     * If the upload is an image with different sizes, return a picture element
     */
    const PictureHTML = ({ children }): React.ReactNode => <picture>{children}</picture>

    const children = []

    // Iterate through each size in the data.sizes object
    for (const size in sizes) {
      const imageSize = sizes[size]

      // Skip if any property of the size object is null
      if (
        !imageSize.width ||
        !imageSize.height ||
        !imageSize.mimeType ||
        !imageSize.filesize ||
        !imageSize.filename ||
        !imageSize.url
      ) {
        continue
      }
      const imageSizeURL: string = replaceOriginWithServerUrl(removeForwardSlash(media?.url))

      const child = (
        <source
          srcSet={imageSizeURL}
          media="(max-width: ${imageSize.width}px)"
          type="${imageSize.mimeType}"
        />
      )

      children.push(child)
    }

    // Add the default img tag
    const img = <img className="p-1" src={url} alt="" width={media.width} height={media.height} />

    children.push(img)

    return <PictureHTML>{children}</PictureHTML>
  }
}

const renderHeading = (node: SerializedHeadingNode) => {
  switch (node.tag) {
    case 'h1': {
      const childrenContent = populateChildren(node)
      return <h1>{childrenContent}</h1>
    }
    case 'h2': {
      const childrenContent = populateChildren(node)
      return <h2>{childrenContent}</h2>
    }
    case 'h3': {
      const childrenContent = populateChildren(node)
      return <h3>{childrenContent}</h3>
    }
    case 'h4': {
      const childrenContent = populateChildren(node)
      return <h4>{childrenContent}</h4>
    }
    case 'h5': {
      const childrenContent = populateChildren(node)
      return <h5>{childrenContent}</h5>
    }
    case 'h6': {
      const childrenContent = populateChildren(node)
      return <h6>{childrenContent}</h6>
    }
    default: {
      return null
    }
  }
}

const renderLink = (node: SerializedLinkNode) => {
  const childrenContent = populateChildren(node)
  const rel = node.fields.newTab ? ' "noopener noreferrer"' : ''
  const target = node.fields.newTab ? '_blank' : '_self'

  if (node.fields.linkType === 'custom') {
    return (
      <a href={node?.fields?.url} rel={rel} target={target}>
        {childrenContent}
      </a>
    )
  } else {
    const slug = node.fields?.doc?.value['slug'] || '/'
    const href = process.env.PAYLOAD_PUBLIC_SERVER_URL + '/' + slug

    return (
      <a href={href} rel={rel} target={target}>
        {childrenContent}
      </a>
    )
  }
}

const renderYoutube = (node: SerializedYouTubeNode) => {
  return (
    <iframe
      width="100%"
      className="my-8 aspect-video"
      src={`https://www.youtube-nocookie.com/embed/${node.videoID}`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title="Youtube video"
    />
  )
}

const renderBlockQuote = (node: SerializedQuoteNode) => {
  const childrenContent = populateChildren(node)
  return <blockquote>{childrenContent}</blockquote>
}

const renderList = (node: SerializedListNode) => {
  if (node.tag === 'ol') {
    return <ol>{populateChildren(node)}</ol>
  } else if (node.tag === 'ul') {
    if (node.listType === 'check') {
      return <ul>{populateChildren(node, { isCheckList: true })}</ul>
    }

    return <ul>{populateChildren(node)}</ul>
  } else {
    return null
  }
}

const renderListItem = (node: SerializedListItemNode, isCheckList = false, isChecked = false) => {
  const childrenContent = populateChildren(node)
  if (isCheckList) {
    const listBeforeStyle = `before:border before:border-gray-300  before:content-[''] before:w-4 before:h-4 before:absolute before:top-1/2 before:-left-4 before:transform before:-translate-y-1/2 before:block`
    const listBeforeStyleChecked = `before:border before:border-gray-300 before:bg-blue-500 before:content-[''] before:w-4 before:h-4 before:absolute before:top-1/2 before:-left-4 before:transform before:-translate-y-1/2 before:block`
    const listAfterStyle = `after:content-[''] after:border-solid after:border-white after:absolute after:top-1/2 after:-left-2 after:-translate-y-1/2 after:w-1.5 after:h-1.5 after:transform after:-translate-x-1/2 after:-translate-y-1/2 after:rotate-45 after:border-t-0 after:border-r-2 after:border-b-2 after:border-l-0`

    if (node.checked) {
      return (
        <li
          className={cn('relative list-none line-through', listBeforeStyleChecked, listAfterStyle)}
        >
          {childrenContent}
        </li>
      )
    }

    return <li className={cn('relative list-none', listBeforeStyle)}>{childrenContent}</li>
  }

  return <li>{childrenContent}</li>
}

const renderTable = (node: SerializedTableNode) => {
  const childrenContent = populateChildren(node)
  return (
    <Table>
      <TableBody>{childrenContent}</TableBody>
    </Table>
  )
}

const renderTableRow = (node: SerializedTableRowNode) => {
  const childrenContent = populateChildren(node)
  return <TableRow key={uuid()}>{childrenContent}</TableRow>
}

const renderTableCell = (node: SerializedTableCellNode) => {
  const childrenContent = populateChildren(node)
  const bgColor = node.backgroundColor ? node.backgroundColor : ''
  return (
    <TableCell key={uuid()} className="min-w-content" style={{ backgroundColor: bgColor }}>
      {childrenContent}
    </TableCell>
  )
}

const renderCollapsibleContainer = (node: SerializedCollapsibleContainerNode) => {
  const childrenContent = populateChildren(node)
  const isOpen = node.open
  return <CollapsibleContainer isCollapsibleOpen={isOpen} childrenContent={childrenContent} />
}

const renderCollapsibleTitle = (node: CollapsibleTitleNode) => {
  const childrenContent = populateChildren(node)

  return (
    <React.Fragment>
      <div className="flex items-center justify-between space-x-4 px-4">
        <h4 className="text-sm font-semibold">{childrenContent}</h4>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            <ChevronsUpDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        </CollapsibleTrigger>
      </div>
    </React.Fragment>
  )
}

const renderCollapsibleContent = (node: CollapsibleContentNode) => {
  const childrenContent = populateChildren(node)

  return (
    <CollapsibleContent className="space-y-2">
      <div className="rounded-md border px-4 py-3 font-mono text-sm">{childrenContent}</div>
    </CollapsibleContent>
  )
}

const renderGallery = (node: SerializedGalleryNode) => {
  const images = populateChildren(node) as
    | SerializedGalleryImageNode[]
    | SerializedGalleryHandlerNode[]

  const photos: Photo[] = images
    ?.map(image => {
      if (image && image?.src) {
        // if (image?.showCaption && image?.caption) {
        //   return {
        //     src: image.src,
        //     width: image.width || 500,
        //     height: image.height || 500,
        //     title: image.caption
        //   }
        // }
        return {
          src: replaceOriginWithServerUrl(image.src),
          width: image.width || 500,
          height: image.height || 300,
        }
      }
    })
    .filter(Boolean)

  if (!photos || photos.length === 0) {
    return null
  }

  return (
    <div className="my-16">
      <PhotoAlbumClient
        layout={node.galleryLayout as LayoutType}
        photos={photos}
        columns={node.columns || 3}
      />
    </div>
  )
}

const renderGalleryImage = (node: SerializedGalleryImageNode) => {
  return node
}

const elementsTree = (
  node: any,
  args: {
    isCheckList: boolean
  } = {
    isCheckList: false,
  },
): React.ReactNode | SerializedLexicalNodeWithParent => {
  if (!node) {
    return null
  }

  switch (node.type) {
    case 'paragraph':
      return renderParagraph(node)
    case 'text':
      return renderText(node)
    case 'heading':
      return renderHeading(node)
    case 'table':
      return renderTable(node)
    case 'tablerow':
      return renderTableRow(node)
    case 'tablecell':
      return renderTableCell(node)
    case 'link':
      return renderLink(node)
    case 'image':
      return renderImage(node)
    case 'layout-container':
      return renderLayoutContainer(node)
    case 'layout-item':
      return renderLayoutItem(node)
    case 'upload':
      return renderUpload(node)
    case 'youtube':
      return renderYoutube(node)
    case 'quote':
      return renderBlockQuote(node)
    case 'list':
      return renderList(node)
    case 'listitem':
      return renderListItem(node, args.isCheckList)
    case 'collapsible-container':
      return renderCollapsibleContainer(node)
    case 'collapsible-title':
      return renderCollapsibleTitle(node)
    case 'collapsible-content':
      return renderCollapsibleContent(node)
    case 'linebreak':
      return <br />
    case 'gallery':
      return renderGallery(node)
    case 'gallery-image':
      return renderGalleryImage(node)
    default:
      return null
  }
}

const renderRichText = (root: any): React.ReactNode => {
  if (root && root.children && root.children.length > 0) {
    return root.children.map((node: any) => elementsTree(node))
  } else {
    return null
  }
}

export default renderRichText
