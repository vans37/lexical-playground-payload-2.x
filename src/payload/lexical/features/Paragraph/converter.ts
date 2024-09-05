import type { HTMLConverter } from '@payloadcms/richtext-lexical'
import type SerializedParagraphNode from 'lexical'

import { convertLexicalNodesToHTML } from '@payloadcms/richtext-lexical'

//default converter does not respect node format
export const ParagraphConverter: HTMLConverter = {
  converter: async ({ converters, node, parent }) => {
    const pNode = node as SerializedParagraphNode.SerializedParagraphNode

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
  },
  nodeTypes: ['paragraph'],
}
