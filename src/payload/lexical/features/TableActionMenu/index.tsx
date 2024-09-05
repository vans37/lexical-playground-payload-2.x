/* eslint-disable @typescript-eslint/consistent-type-assertions */
import type { FeatureProvider } from '@payloadcms/richtext-lexical'

export const TableActionMenuFeature = (): FeatureProvider => {
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
    key: 'table_action_menu',
  }
}
