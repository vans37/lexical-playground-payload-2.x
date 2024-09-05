import type { HTMLConverter, SerializedLinkNode } from '@payloadcms/richtext-lexical'

import { LinkNode, convertLexicalNodesToHTML } from '@payloadcms/richtext-lexical'

export const linkConverter = (): HTMLConverter => {
  return {
    converter: async ({ converters, node, parent }) => {
      const currNode = node as SerializedLinkNode

      const childrenText = await convertLexicalNodesToHTML({
        converters,
        lexicalNodes: currNode.children,
        parent: {
          ...currNode,
          parent,
        },
      })

      const rel: string = currNode.fields.newTab ? ' rel="noopener noreferrer"' : ''

      const href: string =
        currNode.fields.linkType === 'custom'
          ? currNode.fields.url
          : (currNode.fields.doc?.value as string)

      return `<a href="${href}"${rel}>${childrenText}</a>`
    },
    nodeTypes: [LinkNode.getType()],
  }
}
