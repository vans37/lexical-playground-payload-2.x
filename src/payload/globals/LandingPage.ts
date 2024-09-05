import type { Field, GlobalConfig } from 'payload/types'

import iconPickerField from '@innovixx/payload-icon-picker-field'
import * as fa6Icons from 'react-icons/fa6'

import { isAdminOrEditor } from '../access/isAdminOrEditor'
import revalidateGlobal from './hooks/revalidate'

const HeroField: Field = {
  type: 'collapsible',
  admin: {
    initCollapsed: true,
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'subtitle',
          type: 'text',
          required: true,
        },
        {
          name: 'images',
          type: 'array',
          fields: [
            {
              name: 'src',
              type: 'upload',
              relationTo: 'media',
            },
          ],
          required: true,
        },
      ],
    },
  ],
  label: 'hero',
}

const IncentivesField: Field = {
  type: 'collapsible',
  admin: {
    initCollapsed: true,
  },
  fields: [
    {
      name: 'incentives',
      type: 'array',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          required: true,
        },
        iconPickerField({
          name: 'svg',
          reactIconPack: fa6Icons,
        }),
      ],
      maxRows: 3,
      minRows: 3,
    },
  ],
  label: 'Advantages',
}

const ProductsField: Field = {
  type: 'collapsible',
  admin: {
    initCollapsed: true,
  },
  fields: [
    {
      name: 'products',
      type: 'group',
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          required: true,
        },
        {
          name: 'popular_products',
          type: 'relationship',
          hasMany: true,
          relationTo: ['products'],
           //for select field plugin
           custom: {
            defaultSelect: ['id', 'title', 'status', 'categories', 'images', 'slug'],
          },
          required: true,
        },
      ],
    },
  ],
  label: 'popular products',
}

const CategoriesField: Field = {
  type: 'collapsible',
  admin: {
    initCollapsed: true,
  },
  fields: [
    {
      name: 'categories',
      type: 'group',
      fields: [
        {
          name: 'categories',
          type: 'relationship',
          hasMany: true,
          relationTo: ['categories'],
          required: true,
        },
      ],
    },
  ],
  label: 'popular categories',
}

const LandingPage: GlobalConfig = {
  slug: 'landing_page',
  access: {
    read: isAdminOrEditor,
    update: isAdminOrEditor,
  },
  fields: [HeroField, IncentivesField, ProductsField, CategoriesField],
  hooks: {
    afterChange: [args => revalidateGlobal(args)],
  },
  label: 'Landing page'
}

export default LandingPage
