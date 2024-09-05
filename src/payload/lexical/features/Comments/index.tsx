import type { FeatureProvider } from '@payloadcms/richtext-lexical'
import { INSERT_INLINE_COMMAND } from './plugin'
import { MarkNode } from './nodes'

export const CommentsFeature = (): FeatureProvider => {
  return {
    feature: () => {
      return {
        floatingSelectToolbar: {
          sections: [
            {
              entries: [
                {
                  ChildComponent: () =>
                    import('../../lib/ui/icons/Comments').then(module => module.CommentsIcon),
                  order: 3,
                  key: 'add_comment',
                  onClick: ({ editor }) => {
                    editor.dispatchCommand(INSERT_INLINE_COMMAND, undefined)
                  },
                },
              ],
              key: 'add_comment',
              order: 5,
              type: 'buttons',
            },
          ],
        },
        nodes: [
          {
            type: MarkNode.getType(),
            node: MarkNode,
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
    key: 'comments',
  }
}
