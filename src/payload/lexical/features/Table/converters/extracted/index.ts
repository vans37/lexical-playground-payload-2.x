import type SerializedListNode from '@lexical/list'
import type SerializedHeadingNode from '@lexical/rich-text'
import type { SerializedQuoteNode } from '@lexical/rich-text'
import type {
  SerializedAutoLinkNode,
  SerializedLinkNode,
  SerializedUploadNode,
} from '@payloadcms/richtext-lexical'
import type { SerializedTextNode } from 'lexical'
import type SerializedParagraphNode from 'lexical'
import type { Payload } from 'payload'

import {
  type HTMLConverter,
  NodeFormat,
  convertLexicalNodesToHTML,
} from '@payloadcms/richtext-lexical'

// Element node formatting
export const IS_ALIGN_LEFT = 1
export const IS_ALIGN_CENTER = 2
export const IS_ALIGN_RIGHT = 3
export const IS_ALIGN_JUSTIFY = 4
export const IS_ALIGN_START = 5
export const IS_ALIGN_END = 6

export const TextHTMLConverter = async (node: SerializedTextNode): Promise<string> => {
  let text = node.text

  if (node.format & NodeFormat.IS_BOLD) {
    text = `<strong>${text}</strong>`
  }
  if (node.format & NodeFormat.IS_ITALIC) {
    text = `<em>${text}</em>`
  }
  if (node.format & NodeFormat.IS_STRIKETHROUGH) {
    text = `<span style="text-decoration: line-through">${text}</span>`
  }
  if (node.format & NodeFormat.IS_UNDERLINE) {
    text = `<span style="text-decoration: underline">${text}</span>`
  }
  if (node.format & NodeFormat.IS_CODE) {
    text = `<code>${text}</code>`
  }
  if (node.format & NodeFormat.IS_SUBSCRIPT) {
    text = `<sub>${text}</sub>`
  }
  if (node.format & NodeFormat.IS_SUPERSCRIPT) {
    text = `<sup>${text}</sup>`
  }

  return text
}

export const HeadingHTMLConverter = async (
  node: SerializedHeadingNode.SerializedHeadingNode,
  converters: HTMLConverter[],
  parent: any,
): Promise<string> => {
  const childrenText = await convertLexicalNodesToHTML({
    converters,
    lexicalNodes: node.children,
    parent: {
      ...node,
      parent,
    },
  })

  return '<' + node?.tag + '>' + childrenText + '</' + node?.tag + '>'
}

export const ParagraphHTMLConverter = async (
  node: SerializedParagraphNode.SerializedParagraphNode,
  converters: HTMLConverter[],
  parent: any,
): Promise<string> => {
  const pNode = node

  const format = pNode.format

  let style = ''

  if (format.length > 0) {
    style = `text-align: ${format}`
  }

  const childrenText = await convertLexicalNodesToHTML({
    converters,
    lexicalNodes: pNode.children,
    parent: { ...pNode, parent },
  })

  if (style.length > 0) {
    return `<p style="${style}">${childrenText}</p>`
  } else {
    return `<p>${childrenText}</p>`
  }
}

export const ListHTMLConverter = async (
  node: SerializedListNode.SerializedListNode,
  converters: HTMLConverter[],
  parent: any,
): Promise<string> => {
  const childrenText = await convertLexicalNodesToHTML({
    converters,
    lexicalNodes: node.children,
    parent: {
      ...node,
      parent,
    },
  })

  return `<${node?.tag} class="${node?.listType}">${childrenText}</${node?.tag}>`
}

export const ListItemHTMLConverter = async (
  node: SerializedListNode.SerializedListItemNode,
  converters: HTMLConverter[],
  parent: any,
): Promise<string> => {
  const childrenText = await convertLexicalNodesToHTML({
    converters,
    lexicalNodes: node.children,
    parent: {
      ...node,
      parent,
    },
  })

  if ('listType' in parent && parent?.listType === 'check') {
    return `<li aria-checked=${node.checked ? 'true' : 'false'} class="${
      'list-item-checkbox' + node.checked
        ? 'list-item-checkbox-checked'
        : 'list-item-checkbox-unchecked'
    }"
            role="checkbox"
            tabIndex=${-1}
            value=${node?.value}
        >
            ${childrenText}
            </li>`
  } else {
    return `<li value=${node?.value}>${childrenText}</li>`
  }
}

export const LinkHTMLConverter = async (
  node: SerializedLinkNode,
  converters: HTMLConverter[],
  parent: any,
): Promise<string> => {
  const childrenText = await convertLexicalNodesToHTML({
    converters,
    lexicalNodes: node.children,
    parent: {
      ...node,
      parent,
    },
  })

  const rel: string = node.fields.newTab ? ' rel="noopener noreferrer"' : ''

  const href: string =
    node.fields.linkType === 'custom' ? node.fields.url : (node.fields.doc?.value as string)

  return `<a href="${href}"${rel}>${childrenText}</a>`
}

export const QuoteHTMLConverter = async (
  node: SerializedQuoteNode,
  converters: HTMLConverter[],
  parent: any,
): Promise<string> => {
  const childrenText = await convertLexicalNodesToHTML({
    converters,
    lexicalNodes: node.children,
    parent: {
      ...node,
      parent,
    },
  })

  return `<blockquote>${childrenText}</blockquote>`
}

export const AutoLinkHTMLConverter = async (
  node: SerializedAutoLinkNode,
  converters: HTMLConverter[],
  parent: any,
): Promise<string> => {
  const childrenText = await convertLexicalNodesToHTML({
    converters,
    lexicalNodes: node.children,
    parent: {
      ...node,
      parent,
    },
  })

  const rel: string = node.fields.newTab ? ' rel="noopener noreferrer"' : ''

  let href: string = node.fields.url
  if (node.fields.linkType === 'internal') {
    href =
      typeof node.fields.doc?.value === 'string'
        ? node.fields.doc?.value
        : node.fields.doc?.value?.id
  }

  return `<a href="${href}"${rel}>${childrenText}</a>`
}

function getAbsoluteURL(url: string, payload): string {
  return url?.startsWith('http') ? url : (payload?.config?.serverURL || '') + url
}

export const UploadHTMLConverter = async (
  node: SerializedUploadNode,
  payload: Payload,
): Promise<string> => {
  const uploadDocument: any = await payload.findByID({
    id: node.value.id,
    collection: node.relationTo as any,
  })
  const url: string = getAbsoluteURL(uploadDocument?.url as string, payload)

  /**
   * If the upload is not an image, return a link to the upload
   */
  if (!(uploadDocument?.mimeType as string)?.startsWith('image')) {
    return `<a href="${url}" rel="noopener noreferrer">${uploadDocument.filename}</a>`
  }

  /**
   * If the upload is a simple image with no different sizes, return a simple img tag
   */
  if (!uploadDocument?.sizes || !Object.keys(uploadDocument?.sizes).length) {
    return `<img src="${url}" alt="${uploadDocument?.filename}" width="${uploadDocument?.width}"  height="${uploadDocument?.height}"/>`
  }

  /**
   * If the upload is an image with different sizes, return a picture element
   */
  let pictureHTML = '<picture>'

  // Iterate through each size in the data.sizes object
  for (const size in uploadDocument.sizes) {
    const imageSize = uploadDocument.sizes[size]

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
    const imageSizeURL: string = getAbsoluteURL(imageSize?.url as string, payload)

    pictureHTML += `<source srcset="${imageSizeURL}" media="(max-width: ${imageSize.width}px)" type="${imageSize.mimeType}">`
  }

  // Add the default img tag
  pictureHTML += `<img src="${url}" alt="Image" width="${uploadDocument.width}" height="${uploadDocument.height}">`
  pictureHTML += '</picture>'

  return pictureHTML
}
