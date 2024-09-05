import type { CollectionConfig } from 'payload/types'

import { isAdmin } from '../access/isAdmin'

const LexicalComments: CollectionConfig = {
  slug: 'lexical-comments',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdmin,
    update: isAdmin,
  },
  admin: {
    hidden: true,
  },
  fields: [
    {
      name: 'comments',
      type: 'text',
    },
    {
      name: 'hash',
      type: 'text',
      required: true,
    },
  ],

  labels: {
    plural: 'Comments',
    singular: 'Comment',
  },
}

export default LexicalComments
