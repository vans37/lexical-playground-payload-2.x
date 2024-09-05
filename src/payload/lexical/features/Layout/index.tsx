import type { FeatureProvider } from '@payloadcms/richtext-lexical'
import { SlashMenuOption } from '@payloadcms/richtext-lexical'
import { INSERT_LAYOUT_DIALOG_COMMAND } from './plugin'
import { LayoutItemNode } from './nodes/LayoutItemNode'
import { LayoutContainerNode } from './nodes/LayoutContainerNode'
import { LayoutContainerConverter, LayoutItemConverter } from './converters'

export const LayoutFeature = (): FeatureProvider => {
  return {
    feature: () => {
      return {
        nodes: [
          {
            type: LayoutContainerNode.getType(),
            node: LayoutContainerNode,
            converters: {
              html: LayoutContainerConverter,
            },
          },
          {
            type: LayoutItemNode.getType(),
            node: LayoutItemNode,
            converters: {
              html: LayoutItemConverter,
            },
          },
        ],
        plugins: [
          {
            Component: () => import('./plugin').then(module => module.LayoutPlugin),
            position: 'normal',
          },
        ],
        props: null,
        slashMenu: {
          options: [
            {
              displayName: 'Layout',
              key: 'layout',
              options: [
                new SlashMenuOption('Layout', {
                  Icon: () => import('../../lib/ui/icons/Layout').then(module => module.LayoutIcon),
                  displayName: 'Layout',
                  keywords: ['layout', 'columns'],
                  onSelect: ({ editor }) => {
                    editor.dispatchCommand(INSERT_LAYOUT_DIALOG_COMMAND, true)
                  },
                }),
              ],
            },
          ],
        },
      }
    },
    key: 'layout',
  }
}
