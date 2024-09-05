import type { Field } from 'payload/types'

import deepMerge from '../utilities/deepMerge'

export type LinkAppearances = 'default' | 'primary' | 'secondary'

type LinkType = (options?: { disableLabel?: boolean; overrides?: Record<string, unknown> }) => Field

const link: LinkType = ({ disableLabel = false, overrides = {} } = {}) => {
  const linkResult: Field = {
    name: 'link',
    type: 'group',
    admin: {
      hideGutter: true,
    },
    fields: [
      {
        type: 'row',
        fields: [
          {
            name: 'type',
            type: 'radio',
            admin: {
              layout: 'horizontal',
              width: '50%',
            },
            defaultValue: 'reference',
            options: [
              {
                label: 'Internal document',
                value: 'reference',
              },
              {
                label: 'Custom URL',
                value: 'custom',
              },
            ],
          },
          {
            name: 'newTab',
            type: 'checkbox',
            admin: {
              style: {
                alignSelf: 'flex-end',
              },
              width: '50%',
            },
            defaultValue: false,
            label: 'Open in new tab',
          },
        ],
      },
    ],
    label: {
      ru: 'Link',
    },
  }

  const linkTypes: Field[] = [
    {
      name: 'reference',
      type: 'relationship',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'reference',
      },
      //for select field plugin
      custom: {
        defaultSelect: ['id', 'title', 'slug'],
      },
      label: 'Document',
      maxDepth: 1,
      relationTo: ['products'],
      required: true,
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.type === 'custom',
      },
      label: {
        ru: 'Custom URL',
      },
      required: true,
    },
  ]

  if (!disableLabel) {
    linkTypes.map(linkType => ({
      ...linkType,
      admin: {
        ...linkType.admin,
        width: '50%',
      },
    }))

    linkResult.fields.push({
      type: 'row',
      fields: [
        ...linkTypes,
        {
          name: 'label',
          type: 'text',
          admin: {
            width: '33%',
          },
          label: 'Label',
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          admin: {
            width: '33%',
          },
          label: 'Description',
          required: false,
        },
      ],
    })
  } else {
    linkResult.fields = [...linkResult.fields, ...linkTypes]
  }

  return deepMerge(linkResult, overrides)
}

export default link
