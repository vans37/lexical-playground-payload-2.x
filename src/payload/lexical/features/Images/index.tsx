import type { FeatureProvider } from '@payloadcms/richtext-lexical'
import { ImageNode } from './nodes/ImageNode'
import { ImagesConverter } from './converters'
import { HashtagNode } from '@lexical/hashtag'

export type ImagesFeatureType = {
  origin: string
}

export const ImagesFeature = ({ origin }: ImagesFeatureType): FeatureProvider => {
  return {
    feature: () => {
      return {
        nodes: [
          {
            type: ImageNode.getType(),
            converters: {
              html: ImagesConverter,
            },
            node: ImageNode,
          },
          {
            type: HashtagNode.getType(),
            node: HashtagNode,
          },
        ],
        plugins: [
          {
            Component: () => import('./plugin').then(module => module.default),
            position: 'normal',
          },
        ],
        props: {
          origin,
        },
      }
    },
    key: 'images',
  }
}
