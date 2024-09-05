import type { FeatureProvider } from '@payloadcms/richtext-lexical'

export const ContextMenuFeature = (): FeatureProvider => {
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
    key: 'context_menu',
  }
}
