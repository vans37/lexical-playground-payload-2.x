import type { CollectionConfig } from 'payload/types'

import { lexicalEditor, lexicalHTML } from '@payloadcms/richtext-lexical'

import { slugifyField } from '../../lib/utils'
import { isAdmin } from '../access/isAdmin'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { QOLFeatures } from '../lexical/features/QualityOfLife'
import { uploadImagesHook } from '../lexical/features/UploadImages/fieldHook'
import theme from '../lexical/lib/PlaygroundEditorTheme'
import revalidateCollection from './hooks/revalidate'

export const Products: CollectionConfig = {
  slug: 'products',
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
      name: 'short_description',
      type: 'textarea',
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
      type: 'collapsible',
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          name: 'images',
          type: 'array',
          fields: [
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
            },
          ],
          required: true,
        },
      ],
      label: 'Product images',
    },

    {
      name: 'categories',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: 'categories',
      required: true,
    },
    {
      name: 'description',
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
    lexicalHTML('description', { name: 'description_html' }),
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
    plural: 'Products',
    singular: 'Product',
  },
}
