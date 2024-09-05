import { webpackBundler } from '@payloadcms/bundler-webpack'
import { postgresAdapter } from '@payloadcms/db-postgres'
import seoPlugin from '@payloadcms/plugin-seo'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload/config'

import Categories from './payload/collections/Categories'
import LexicalComments from './payload/collections/LexicalComments'
import { Media } from './payload/collections/Media'
import Orders from './payload/collections/Orders'
import { Pages } from './payload/collections/Pages'
import { Products } from './payload/collections/Products'
import { Users } from './payload/collections/Users'
import { seed } from './payload/endpoints/seed'
import LandingPage from './payload/globals/LandingPage'
import NavMenu from './payload/globals/NavMenu'
import { fieldsSelect } from './payload/payload-enchants-master/packages/fields-select/src'

const mockModulePath = path.resolve(__dirname, './emptyModuleMock.js')

export default buildConfig({
  admin: {
    bundler: webpackBundler(),
    user: Users.slug,
    webpack: config => {
      return {
        ...config,
        resolve: {
          ...config.resolve,
          alias: {
            ...config.resolve?.alias,
            dotenv: path.resolve(__dirname, './dotenv.js'),
            express: mockModulePath,
            [path.resolve(__dirname, 'endpoints/seed')]: mockModulePath,
          },
          fallback: {
            crypto: false,
            fs: false,
            stream: false,
            vm: false,
            // http: false,
            // https: false,
            // util: false,
            // canvas: false,
            // net: false,
            // tls: false,
            // url: false,
            // assert: false,
            // zlib: false,
            // os: false,
            // child_process: false,
          },
        },
      }
    },
  },
  collections: [Products, Categories, Orders, Pages,  Media, Users, LexicalComments],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI,
      max: 300,
    },
  }),
  editor: lexicalEditor(),
  endpoints: [
    {
      handler: seed,
      method: 'get',
      path: '/seed',
    }
  ],
  /*
    *If json size value is default or too small,
    *Saving documents with lexical field
    *Will fail, because it will exceed json limit, especially if lexical image node is enabled:
    *Pasted images from clipboard are base64 encoded, so the size of the field will be huge before they are uploaded (if upload of lexical images
    *Enabled, they will be uploaded to Media collection and src of base64 will be replaced with url from uploaded collection item,
    *If not, they will stay encoded as base64) 
  */
  express: {
    json: {
      limit: 1024 * 1024 * 1024,
    },
  },
  globals: [LandingPage, NavMenu],
  plugins: [
    seoPlugin({
      collections: ['products', 'pages', 'categories'],
      fields: [
        {
          name: 'robots',
          type: 'select',
          defaultValue: 'index',
          options: [
            {
              label: 'index',
              value: 'index',
            },
            {
              label: 'noindex',
              value: 'noindex',
            },
            {
              label: 'follow',
              value: 'follow',
            },
            {
              label: 'nofollow',
              value: 'nofollow',
            },
            {
              label: 'none',
              value: 'none',
            },
          ],
        },
        {
          name: 'keywords',
          type: 'textarea',
        },
        {
          name: 'open_graph',
          type: 'group',
          fields: [
            {
              name: 'og_title',
              type: 'text',
            },
            {
              name: 'og_image',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'og_description',
              type: 'textarea',
            },
            {
              name: 'og_type',
              type: 'select',
              options: [
                {
                  label: 'Article',
                  value: 'article',
                },
                {
                  label: 'Movie',
                  value: 'video.movie',
                },
                {
                  label: 'Song',
                  value: 'music.song',
                },
              ],
            },
            {
              name: 'og_site_name',
              type: 'text',
            },
          ],
          label: 'Open Graph',
        },
      ],
      globals: ['landing_page'],
      tabbedUI: true,
      uploadsCollection: 'media',
    }),
    fieldsSelect(),
  ],
  rateLimit: {
    max: 100000,
    trustProxy: true
  },
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || '',
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  upload: {
    limits: {
      fieldSize: 1024 * 1024 * 1024,
    },
  },
})
