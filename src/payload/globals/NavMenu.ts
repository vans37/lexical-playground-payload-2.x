import type { GlobalConfig } from 'payload/types'

import { isAdminOrEditor } from '../access/isAdminOrEditor'
import link from '../fields/link'
import revalidateGlobal from './hooks/revalidate'

const NavMenu: GlobalConfig = {
  slug: 'navigation',
  access: {
    read: isAdminOrEditor,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'links',
      type: 'array',
      fields: [
        {
          name: 'parent_link',
          type: 'group',
          fields: [
            {
              name: 'url',
              type: 'text',
              label: 'URL',
              required: true,
            },
            {
              name: 'label',
              type: 'text',
              label: 'Label',
              required: true,
            },
          ],
          label: {
            ru: 'Parent link',
          },
        },
        {
          name: 'dropdown_links',
          type: 'array',
          fields: [link()],
          label: 'Dropdown links',
          labels: {
            plural: 'Links',
            singular: 'Link',
          },
        },
      ],
      label: 'Navmenu links',
      labels: {
        plural: 'Links',
        singular: 'Link',
      },
    },
  ],
  hooks: {
    afterChange: [args => revalidateGlobal(args)],
  },
  label: 'Navmenu',
}

export default NavMenu
