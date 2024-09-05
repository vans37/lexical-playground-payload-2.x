import type { FeatureProvider } from '@payloadcms/richtext-lexical'

import { OPEN_COLOR_PICKER_COMMAND } from './plugin'
export const TextColorFeature = (): FeatureProvider => {
  return {
    feature: () => {
      return {
        floatingSelectToolbar: {
          sections: [
            {
              entries: [
                {
                  ChildComponent: () =>
                    import('../../../lib/ui/icons/FontColor').then(module => module.FontColorIcon),
                  order: 2,
                  key: 'text_color',
                  onClick: ({ editor }) => {
                    editor.dispatchCommand(OPEN_COLOR_PICKER_COMMAND, true)
                  },
                },
              ],
              key: 'text_color',
              order: 5,
              type: 'buttons',
            },
          ],
        },
        plugins: [
          {
            Component: () => import('./plugin').then(module => module.TextColorPlugin),
            position: 'normal',
          },
        ],
        props: null,
      }
    },
    key: 'text_color',
  }
}
