import type { FeatureProvider } from '@payloadcms/richtext-lexical'
import { SlashMenuOption } from '@payloadcms/richtext-lexical'
import { YouTubeNode } from './nodes/YouTubeNode'
import { INSERT_EMBED_COMMAND } from '@lexical/react/LexicalAutoEmbedPlugin'
import YoutubeConverter from './converters'

export const YoutubeFeature = (): FeatureProvider => {
  return {
    feature: () => {
      return {
        slashMenu: {
          options: [
            {
              displayName: 'Youtube',
              key: 'youtube',
              options: [
                new SlashMenuOption('Youtube', {
                  Icon: () =>
                    import('../../lib/ui/icons/Youtube').then(module => module.YoutubeIcon),
                  displayName: 'Youtube',
                  keywords: ['youtube', 'video'],
                  onSelect: ({ editor }) => {
                    editor.dispatchCommand(INSERT_EMBED_COMMAND, 'youtube-video')
                  },
                }),
              ],
            },
          ],
        },
        nodes: [
          {
            type: YouTubeNode.getType(),
            converters: {
              html: YoutubeConverter,
            },
            node: YouTubeNode,
          },
        ],
        plugins: [
          {
            Component: () => import('./plugin').then(module => module.default),
            position: 'normal',
          },
          {
            Component: () => import('./AutoEmbedPlugin').then(module => module.default),
            position: 'normal',
          },
        ],
        props: null,
      }
    },
    key: 'youtube',
  }
}
