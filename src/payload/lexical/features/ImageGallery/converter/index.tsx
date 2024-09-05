import { type HTMLConverter, convertLexicalNodesToHTML } from '@payloadcms/richtext-lexical'
import type { SerializedGalleryNode } from '../nodes/GalleryNode'
import { GalleryNode } from '../nodes/GalleryNode'
import type { SerializedGalleryImageNode } from '../nodes/GalleryImageNode'
import { GalleryImageNode } from '../nodes/GalleryImageNode'
import { replaceOriginWithServerUrl } from '../../../../utilities/utils'

export const GalleryConverter: HTMLConverter<SerializedGalleryNode> = {
  converter: async ({ converters, node, parent }) => {
    const children = await convertLexicalNodesToHTML({
      converters,
      lexicalNodes: node.children,
      parent: { ...node, parent },
    })

    const cols = node.columns || 3

    return `<div style="display: grid; grid-template-columns: repeat(${cols}, 1fr);">${children}</div>`
  },
  nodeTypes: [GalleryNode.getType()],
}

export const GalleryImageConverter: HTMLConverter<SerializedGalleryImageNode> = {
  converter: ({ node }) => {
    const imgSrc = replaceOriginWithServerUrl(node.src)

    return String.raw`<div>
                        <img src='${imgSrc}' />
                      </div>`
  },
  nodeTypes: [GalleryImageNode.getType()],
}
