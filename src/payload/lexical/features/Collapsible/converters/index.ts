import { type HTMLConverter, convertLexicalNodesToHTML } from '@payloadcms/richtext-lexical'

import type { SerializedCollapsibleContainerNode } from '../nodes/CollapsibleContainerNode'
import type { SerializedCollapsibleContentNode } from '../nodes/CollapsibleContentNode'
import type { SerializedCollapsibleTitleNode } from '../nodes/CollapsibleTitleNode'

import { CollapsibleContainerNode } from '../nodes/CollapsibleContainerNode'
import { CollapsibleContentNode } from '../nodes/CollapsibleContentNode'
import { CollapsibleTitleNode } from '../nodes/CollapsibleTitleNode'

//This is an opinionated converter, you can adjust it to your needs
export const CollapsibleTitleConverter: HTMLConverter<SerializedCollapsibleTitleNode> = {
  converter: async ({ converters, node, parent }) => {
    const childrenText = await convertLexicalNodesToHTML({
      converters,
      lexicalNodes: node.children,
      parent: { ...node, parent },
    })
    return `<summary>${childrenText}</summary>`
  },
  nodeTypes: [CollapsibleTitleNode.getType()],
}

export const CollapsibleContentConverter: HTMLConverter<SerializedCollapsibleContentNode> = {
  converter: async ({ converters, node, parent }) => {
    const childrenText = await convertLexicalNodesToHTML({
      converters,
      lexicalNodes: node.children,
      parent: { ...node, parent },
    })
    return `<div>${childrenText}</div>`
  },
  nodeTypes: [CollapsibleContentNode.getType()],
}

export const CollapsibleContainerConverter: HTMLConverter<SerializedCollapsibleContainerNode> = {
  converter: async ({ converters, node, parent }) => {
    const childrenText = await convertLexicalNodesToHTML({
      converters,
      lexicalNodes: node.children,
      parent: { ...node, parent },
    })
    return `<details>${childrenText}</details>`
  },
  nodeTypes: [CollapsibleContainerNode.getType()],
}
