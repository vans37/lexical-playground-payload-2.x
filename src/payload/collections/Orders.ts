import type { CollectionConfig } from 'payload/types'

import { isAdmin } from '../access/isAdmin'
import { isAdminOrEditor } from '../access/isAdminOrEditor'

const Orders: CollectionConfig = {
  slug: 'orders',
  access: {
    create: isAdmin,
    delete: isAdmin,
    read: isAdminOrEditor,
    update: isAdminOrEditor,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'client_name',
      type: 'text',
      required: true,
    },
    {
      name: 'client_phone',
      type: 'text',
      required: true,
    },
    {
      name: 'client_message',
      type: 'textarea',
    },
  ],
  labels: {
    plural: 'Orders',
    singular: 'Order',
  },
}

export default Orders
