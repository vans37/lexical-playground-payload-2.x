import { type HTMLConverter, convertLexicalNodesToHTML } from '@payloadcms/richtext-lexical'

import type { SerializedLayoutContainerNode } from '../nodes/LayoutContainerNode'
import type { SerializedLayoutItemNode } from '../nodes/LayoutItemNode'

import { LayoutContainerNode } from '../nodes/LayoutContainerNode'
import { LayoutItemNode } from '../nodes/LayoutItemNode'

export const LayoutContainerConverter: HTMLConverter<SerializedLayoutContainerNode> = {
  converter: async ({ converters, node, parent }) => {
    const childrenText = await convertLexicalNodesToHTML({
      converters,
      lexicalNodes: node.children,
      parent: { ...node, parent },
    })

    return `<div style="display: grid; grid-template-columns: ${node.templateColumns}">${childrenText}</div>`
  },
  nodeTypes: [LayoutContainerNode.getType()],
}

export const LayoutItemConverter: HTMLConverter<SerializedLayoutItemNode> = {
  converter: async ({ converters, node, parent }) => {
    const childrenText = await convertLexicalNodesToHTML({
      converters,
      lexicalNodes: node.children,
      parent: { ...node, parent },
    })
    return `<div>${childrenText}</div>`
  },
  nodeTypes: [LayoutItemNode.getType()],
}
