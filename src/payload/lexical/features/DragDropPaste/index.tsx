import type { FeatureProvider } from '@payloadcms/richtext-lexical'

export const DragDropPasteFeature = (): FeatureProvider => {
  return {
    feature: () => {
      return {
        plugins: [
          {
            Component: () => import('./plugin').then(module => module.default),
            position: 'normal',
          },
        ],
        props: null,
      }
    },
    key: 'drag_drop_paste',
  }
}
