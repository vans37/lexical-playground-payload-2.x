import { SlashMenuOption, type FeatureProvider } from '@payloadcms/richtext-lexical'
import { INSERT_GALLERY_COMMAND } from './plugin'
import { GalleryNode } from './nodes/GalleryNode'
import { GalleryImageNode } from './nodes/GalleryImageNode'
import { GalleryConverter, GalleryImageConverter } from './converter'
import { GalleryHandlerNode } from './nodes/GalleryHandlerNode'

export const GalleryFeature = (): FeatureProvider => {
  return {
    feature: () => {
      return {
        nodes: [
          {
            type: GalleryNode.getType(),
            converters: {
              html: GalleryConverter,
            },
            node: GalleryNode,
          },
          {
            type: GalleryImageNode.getType(),
            converters: {
              html: GalleryImageConverter,
            },
            node: GalleryImageNode,
          },
          {
            type: GalleryHandlerNode.getType(),
            converters: {
              html: {
                converter: () => {
                  return ''
                },
                nodeTypes: [GalleryHandlerNode.getType()],
              },
            },
            node: GalleryHandlerNode,
          },
        ],
        plugins: [
          {
            Component: () => import('./plugin').then(module => module.default),
            position: 'bottom',
          },
          {
            Component: () => import('./plugin/Reorder').then(module => module.default),
            position: 'bottom',
          },
        ],
        props: null,
        slashMenu: {
          options: [
            {
              displayName: 'Gallery',
              key: 'gallery',
              options: [
                new SlashMenuOption('Gallery', {
                  Icon: () =>
                    import('../../lib/ui/icons/Gallery').then(module => module.GalleryIcon),
                  displayName: 'Gallery',
                  keywords: ['gallery'],
                  onSelect: ({ editor }) => {
                    editor.dispatchCommand(INSERT_GALLERY_COMMAND, null)
                  },
                }),
              ],
            },
          ],
        },
      }
    },
    key: 'gallery',
  }
}
