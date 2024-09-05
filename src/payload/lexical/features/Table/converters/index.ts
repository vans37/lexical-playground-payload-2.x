import type {
  SerializedTableCellNode,
  SerializedTableNode,
  SerializedTableRowNode,
} from '@lexical/table'

import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { type HTMLConverter } from '@payloadcms/richtext-lexical'
import payload from 'payload'

import { ParagraphConverter } from '../../Paragraph/converter'
import YoutubeConverter from '../../Youtube/converters'
import {
  AutoLinkHTMLConverter,
  HeadingHTMLConverter,
  LinkHTMLConverter,
  ListHTMLConverter,
  ListItemHTMLConverter,
  QuoteHTMLConverter,
  TextHTMLConverter,
  UploadHTMLConverter,
} from './extracted'

const generateHTML = async (
  childIndex: number,
  node: any,
  converters: HTMLConverter[],
  parent: any,
): Promise<string> => {
  let html = ''

  if (node.type === 'table') {
    const rowsHTML = await Promise.all(
      node.children.map(async (child: any) => {
        return generateHTML(childIndex, child, converters, parent)
      }),
    )
    html += `<table>${rowsHTML.join('')}</table>`
  } else if (node.type === 'tablerow') {
    const style = node.height ? `style="height: ${node.height}px;"` : ''
    const cellsHTML = await Promise.all(
      node.children.map(async (child: any) => {
        return generateHTML(childIndex, child, converters, parent)
      }),
    )
    html += `<tr ${style}>${cellsHTML.join('')}</tr>`
  } else if (node.type === 'tablecell') {
    const bgColor = node.backgroundColor ? `background-color: ${node.backgroundColor};` : ''
    const width = node.width ? `width: ${node.width}px;` : ''
    const style = bgColor || width ? `style="${bgColor}${width}"` : ''
    const cellsHTML = await Promise.all(
      node.children.map(async (child: any) => {
        return generateHTML(childIndex, child, converters, parent)
      }),
    )
    html += `<td ${style}>${cellsHTML.join('')}</td>`
  } else if (node.type === 'paragraph') {
    html += await ParagraphConverter.converter({ childIndex, converters, node, parent })
  } else if (node.type === 'text') {
    html += await TextHTMLConverter(node)
  } else if (node.type === 'linebreak') {
    html += 'br'
  } else if (node.type === 'upload') {
    html += await UploadHTMLConverter(node, payload)
  } else if (node.type === 'heading') {
    html += await HeadingHTMLConverter(node, converters, parent)
  } else if (node.type === 'list') {
    html += await ListHTMLConverter(node, converters, parent)
  } else if (node.type === 'listitem') {
    html += await ListItemHTMLConverter(node, converters, parent)
  } else if (node.type === 'link') {
    html += await LinkHTMLConverter(node, converters, parent)
  } else if (node.type === 'autolink') {
    html += await AutoLinkHTMLConverter(node, converters, parent)
  } else if (node.type === 'quote') {
    html += await QuoteHTMLConverter(node, converters, parent)
  } else if (node.type === 'youtube') {
    html += await YoutubeConverter.converter({ childIndex, converters, node, parent })
  } else {
    return ''
  }

  return html
}

export const TableConverter: HTMLConverter<SerializedTableNode> = {
  converter: async ({ childIndex, converters, node, parent }) => {
    const htmlContent = await generateHTML(childIndex, node, converters, parent)
    return htmlContent
  },
  nodeTypes: [TableNode.getType()],
}

export const TableCellConverter: HTMLConverter<SerializedTableCellNode> = {
  converter: async ({ childIndex, converters, node, parent }) => {
    const htmlContent = await generateHTML(childIndex, node, converters, parent)
    return htmlContent
  },
  nodeTypes: [TableCellNode.getType()],
}

export const TableRowConverter: HTMLConverter<SerializedTableRowNode> = {
  converter: async ({ childIndex, converters, node, parent }) => {
    const htmlContent = await generateHTML(childIndex, node, converters, parent)
    return htmlContent
  },
  nodeTypes: [TableRowNode.getType()],
}
