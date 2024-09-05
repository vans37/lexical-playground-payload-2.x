import type { FeatureProvider } from '@payloadcms/richtext-lexical'

export const ActionsFeature = (): FeatureProvider => {
  return {
    feature: () => {
      return {
        plugins: [
          {
            Component: () => import('./plugin').then(module => module.default),
            position: 'normal',
          },
          {
            Component: () => import('./ClearEditor').then(module => module.default),
            position: 'normal',
          },
          {
            Component: () => import('./SpeechToText').then(module => module.default),
            position: 'normal',
          },
        ],
        props: null,
      }
    },
    key: 'actions',
  }
}
