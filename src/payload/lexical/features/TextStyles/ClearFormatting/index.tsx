import type { FeatureProvider } from '@payloadcms/richtext-lexical'
import { CLEAR_FORMATTING_COMMAND } from './plugin'

export const ClearFormattingFeature = (): FeatureProvider => {
  return {
    feature: () => {
      return {
        floatingSelectToolbar: {
          sections: [
            {
              entries: [
                {
                  ChildComponent: () =>
                    import('../../../lib/ui/icons/ClearFormatting').then(
                      module => module.ClearFormattingIcon,
                    ),
                  order: 1,
                  key: 'clear_formatting',
                  onClick: ({ editor }) => {
                    editor.dispatchCommand(CLEAR_FORMATTING_COMMAND, true)
                  },
                },
              ],
              key: 'clear_formatting',
              order: 5,
              type: 'buttons',
            },
          ],
        },
        plugins: [
          {
            Component: () => import('./plugin').then(module => module.ClearFormattingPlugin),
            position: 'normal',
          },
        ],
        props: null,
      }
    },
    key: 'clear_formatting',
  }
}
