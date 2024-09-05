import type { CollectionConfig } from 'payload/types'

import { slugifyField } from '../../lib/utils'
import revalidateCollection from './hooks/revalidate'

const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    read: () => true,
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
      name: 'image',
      type: 'upload',
      relationTo: 'media',
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
    plural: 'Categories',
    singular: 'Category',
  },
}

export default Categories
