import type { CollectionConfig } from 'payload/types'

import { lexicalEditor } from '@payloadcms/richtext-lexical'

import { slugifyField } from '../../lib/utils'
import { isAdmin } from '../access/isAdmin'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { QOLFeatures } from '../lexical/features/QualityOfLife'
import { uploadImagesHook } from '../lexical/features/UploadImages/fieldHook'
import theme from '../lexical/lib/PlaygroundEditorTheme'
import revalidateCollection from './hooks/revalidate'

export const Pages: CollectionConfig = {
  slug: 'pages',
  access: {
    create: isAdminOrEditor,
    delete: isAdmin,
    read: isAdminOrEditor,
    update: isAdminOrEditor,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'status',
      type: 'select',
      admin: {
        position: 'sidebar',
      },
      defaultValue: 'published',
      options: [
        {
          label: 'Published',
          value: 'published',
        },
        {
          label: 'Draft',
          value: 'draft',
        },
      ],
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [...defaultFeatures, ...QOLFeatures(
          {
            images: {
              origin: process.env.PAYLOAD_PUBLIC_SERVER_URL
            }
          }
        )],
        lexical: {
          namespace: 'lexical',
          theme,
        },
      }),
      hooks: {
        beforeChange: [async args => uploadImagesHook(args)],
      },
    },
    {
      name: 'slug',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
      hooks: {
        beforeChange: [slugifyField],
      },
    },
  ],
  hooks: {
    afterChange: [args => revalidateCollection(args)],
  },
  labels: {
    plural: 'Pages',
    singular: 'Page',
  },
}
