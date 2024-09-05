import type { FeatureProvider } from '@payloadcms/richtext-lexical'

import { OPEN_COLOR_PICKER_COMMAND } from './plugin'
export const TextBackgroundFeature = (): FeatureProvider => {
  return {
    feature: () => {
      return {
        floatingSelectToolbar: {
          sections: [
            {
              entries: [
                {
                  ChildComponent: () =>
                    import('../../../lib/ui/icons/BackgroundColor').then(
                      module => module.BackgroundColorIcon,
                    ),
                  order: 3,
                  key: 'text_background',
                  onClick: ({ editor }) => {
                    editor.dispatchCommand(OPEN_COLOR_PICKER_COMMAND, true)
                  },
                },
              ],
              key: 'text_background',
              order: 5,
              type: 'buttons',
            },
          ],
        },
        plugins: [
          {
            Component: () => import('./plugin').then(module => module.TextStylesPlugin),
            position: 'normal',
          },
        ],
        props: null,
      }
    },
    key: 'text_background',
  }
}
