import type { FeatureProvider } from '@payloadcms/richtext-lexical'

export const ToolbarFeature = (): FeatureProvider => {
  return {
    feature: () => {
      return {
        plugins: [
          {
            Component: () => import('./plugin').then(module => module.default),
            position: 'top',
          },
        ],
        props: null,
      }
    },
    key: 'toolbar',
  }
}
