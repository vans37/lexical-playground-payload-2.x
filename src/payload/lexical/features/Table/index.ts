/* eslint-disable @typescript-eslint/consistent-type-assertions */
import type { FeatureProvider } from '@payloadcms/richtext-lexical'

import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { SlashMenuOption } from '@payloadcms/richtext-lexical'

import { TableCellConverter, TableConverter, TableRowConverter } from './converters'
import { INSERT_NEW_TABLE_DIALOG_COMMAND } from './plugin/'

export const TableFeature = (): FeatureProvider => {
  return {
    feature: () => {
      return {
        nodes: [
          {
            type: TableNode.getType(),
            converters: {
              html: TableConverter,
            },
            node: TableNode,
          },
          {
            type: TableCellNode.getType(),
            converters: {
              html: TableCellConverter,
            },
            node: TableCellNode,
          },
          {
            type: TableRowNode.getType(),
            converters: {
              html: TableRowConverter,
            },
            node: TableRowNode,
          },
        ],
        plugins: [
          {
            Component: () => import('./plugin').then(module => module.TablePlugin),
            position: 'normal',
          },
        ],
        props: null,
        slashMenu: {
          options: [
            {
              displayName: 'Table',
              key: 'table',
              options: [
                new SlashMenuOption('Table', {
                  Icon: () => import('../../lib/ui/icons/Table').then(module => module.TableIcon),
                  displayName: 'Table',
                  keywords: ['table'],
                  onSelect: ({ editor }) => {
                    editor.dispatchCommand(INSERT_NEW_TABLE_DIALOG_COMMAND, null)
                  },
                }),
              ],
            },
          ],
        },
      }
    },
    key: 'table',
  }
}
