import type { CollectionConfig } from 'payload/types'

import { lexicalEditor } from '@payloadcms/richtext-lexical'

import { slugifyField } from '../../lib/utils'
import { isAdmin } from '../access/isAdmin'
import { isAdminOrEditor } from '../access/isAdminOrEditor'
import { Accordion } from './blocks/Accordion'

export const PageBuilder: CollectionConfig = {
  slug: 'page_builder',
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
        editor: lexicalEditor(),
      },
    {
      name: 'builder',
      type: 'blocks',
      blocks: [Accordion]
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
 
  labels: {
    plural: 'Page builder',
    singular: 'Page builder',
  },
}
