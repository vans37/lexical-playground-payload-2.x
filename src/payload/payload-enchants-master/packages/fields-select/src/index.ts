/* 
  Adopted to 2.X from https://github.com/r1tsuu/payload-enchants/tree/master/packages/fields-select
  This plugins helps to omit unused fields and reduces rest api response size. 
  One more thing that I've noticed is that dev server significantly slows down over time 
  when you query lots of relational data, e.g all collections/globals that contain
  lexical json structure.
*/

import type { Plugin } from 'payload/config'

import { applySelect } from './applySelect'
import { withDefaultFields } from './withDefaultFields'

export { applySelect }

const sanitizeSelect = (select: unknown) =>
  Array.isArray(select) && select.every(each => typeof each === 'string')
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    ? (select as string[])
    : undefined

export const fieldsSelect =
  ({
    sanitizeExternals = false,
  }: { sanitizeExternals?: boolean; selectIDByDefault?: boolean } = {}): Plugin =>
  config => {
    return {
      ...config,
      collections: (config.collections ?? []).map(collection => {
        return {
          ...collection,
          hooks: {
            ...(collection.hooks ?? {}),
            afterOperation: [
              ...(collection.hooks?.afterOperation ?? []),
              ({ args, operation, result }) => {
                if (typeof (args as any).currentDepth === 'number') return result

                const select = sanitizeSelect((args as any)?.select)

                if (operation === 'find') {
                  const updated = JSON.parse(JSON.stringify(result))

                  updated.docs.forEach((data: any) => {
                    applySelect({
                      collections: config.collections ?? [],
                      data,
                      fields: withDefaultFields(collection),
                      sanitizeExternals,
                      select,
                    })
                  })

                  return updated
                } else if (operation === 'findByID') {
                  const updated = JSON.parse(JSON.stringify(result))

                  applySelect({
                    collections: config.collections ?? [],
                    data: updated,
                    fields: withDefaultFields(collection),
                    sanitizeExternals,
                    select,
                  })

                  return updated
                }

                return result
              },
            ],
            // beforeOperation: [
            //   ...(collection.hooks?.beforeOperation ?? []),
            //   ({ args, operation, req }) => {
            //     if (operation === 'read') {
            //       console.log(args, operation, req)
            //       if (req.context.select) {
            //         args.select = req.context.select;
            //         delete req.context['select'];
            //       } else if (req.query?.select) {
            //         args.select = req.query.select;
            //         delete req.query['select'];
            //       }
            //     }

            //     return args;
            //   },
            // ],
          },
        }
      }),
      globals: (config.globals ?? []).map(global => {
        return {
          ...global,
          hooks: {
            ...global.hooks,
            afterRead: [
              ...(global.hooks?.afterRead ?? []),
              args => {
                const select = sanitizeSelect(args?.context?.select || args?.req?.query?.select)

                applySelect({
                  collections: config.collections ?? [],
                  data: args.doc,
                  fields: global.fields,
                  sanitizeExternals,
                  select,
                })
              },
            ],
          },
        }
      }),
    }
  }
