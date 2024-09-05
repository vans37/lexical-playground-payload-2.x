import type { CollectionConfig  } from 'payload/types'

import { lexicalEditor } from '@payloadcms/richtext-lexical';

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
    {
      name: 'uuid',
      type: 'text',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
          features: ({ defaultFeatures }) => {
              return defaultFeatures.filter(feature => {
                  return feature.key === 'paragraph' || feature.key === 'link';
              });
          }
      }),
  },
  ],
  labels: {
    plural: 'Media files',
    singular: 'Media file',
  },
  upload: {
    adminThumbnail: 'thumbnail',
    imageSizes: [
      {
        name: 'thumbnail',
        height: 300,
        position: 'centre',
        width: 400,
      },
      {
        name: 'card',
        height: 1024,
        position: 'centre',
        width: 768,
      },
      {
        name: 'tablet',
        height: undefined,
        position: 'centre',
        width: 1024,
      },
    ],
    mimeTypes: ['image/*', 'application/pdf', 'audio/*', 'video/*'],
    staticDir: 'public',
    staticURL: '/',
  },
}
