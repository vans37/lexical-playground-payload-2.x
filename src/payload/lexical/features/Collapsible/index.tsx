import type { FeatureProvider } from '@payloadcms/richtext-lexical'
import { SlashMenuOption } from '@payloadcms/richtext-lexical'
import { CollapsibleContainerNode } from './nodes/CollapsibleContainerNode'
import { CollapsibleContentNode } from './nodes/CollapsibleContentNode'
import { CollapsibleTitleNode } from './nodes/CollapsibleTitleNode'
import { INSERT_COLLAPSIBLE_COMMAND } from './plugin'
import {
  CollapsibleContainerConverter,
  CollapsibleContentConverter,
  CollapsibleTitleConverter,
} from './converters'

export const CollapsibleFeature = (): FeatureProvider => {
  return {
    feature: () => {
      return {
        slashMenu: {
          options: [
            {
              displayName: 'Collapsible container',
              key: 'collapsible',
              options: [
                new SlashMenuOption('Collapsible', {
                  Icon: () =>
                    import('../../lib/ui/icons/Collapsible').then(module => module.CollapsibleIcon),
                  displayName: 'Collapsible',
                  keywords: ['collapsible', 'container', 'hide'],
                  onSelect: ({ editor }) => {
                    editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined)
                  },
                }),
              ],
            },
          ],
        },
        nodes: [
          {
            type: CollapsibleContainerNode.getType(),
            node: CollapsibleContainerNode,
            converters: {
              html: CollapsibleContainerConverter,
            },
          },
          {
            type: CollapsibleContentNode.getType(),
            node: CollapsibleContentNode,
            converters: {
              html: CollapsibleContentConverter,
            },
          },
          {
            type: CollapsibleTitleNode.getType(),
            node: CollapsibleTitleNode,
            converters: {
              html: CollapsibleTitleConverter,
            },
          },
        ],
        plugins: [
          {
            Component: () => import('./plugin').then(module => module.default),
            position: 'normal',
          },
        ],
        props: null,
      }
    },
    key: 'collapsible',
  }
}
