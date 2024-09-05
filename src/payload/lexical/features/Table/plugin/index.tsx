/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import * as React from 'react'
import type {
  HTMLTableElementWithWithTableSelectionState,
  InsertTableCommandPayload,
  TableObserver,
} from '@lexical/table'
import type { NodeKey, LexicalEditor, LexicalCommand } from 'lexical'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $computeTableMap,
  $createTableCellNode,
  $createTableNodeWithDimensions,
  $getNodeTriplet,
  $isTableCellNode,
  $isTableNode,
  $isTableRowNode,
  applyTableHandlers,
  INSERT_TABLE_COMMAND,
  TableCellNode,
  TableNode,
  TableRowNode,
} from '@lexical/table'
import { $insertFirst, $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils'
import {
  $getNodeByKey,
  $isTextNode,
  $nodesOfType,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
} from 'lexical'
import { useEffect, useState } from 'react'
import invariant from '../../../lib/shared/invariant'
import TextInput from '../../../lib/ui/TextInput'
import { DialogActions } from '../../../lib/ui/Dialog'
import { Button, Drawer } from 'payload/components/elements'
import { useModal } from '@faceless-ui/modal'

export function InsertTableDialog({ activeEditor }: { activeEditor: LexicalEditor }): JSX.Element {
  const [rows, setRows] = useState('2')
  const [columns, setColumns] = useState('2')
  const [isDisabled, setIsDisabled] = useState(true)
  const { toggleModal } = useModal()

  useEffect(() => {
    const row = Number(rows)
    const column = Number(columns)
    if (row && row > 0 && row <= 500 && column && column > 0 && column <= 50) {
      setIsDisabled(false)
    } else {
      setIsDisabled(true)
    }
  }, [rows, columns])

  const onClick = () => {
    activeEditor.dispatchCommand(INSERT_TABLE_COMMAND, {
      columns,
      includeHeaders: false,
      rows,
    })
    toggleModal(CREAT_NEW_TABLE_DRAWER_SLUG)
  }

  return (
    <React.Fragment>
      <TextInput
        data-test-id="table-modal-rows"
        label="Rows"
        onChange={setRows}
        placeholder="# of rows (1-500)"
        type="number"
        value={rows}
      />
      <TextInput
        data-test-id="table-modal-columns"
        label="Columns"
        onChange={setColumns}
        placeholder="# of columns (1-50)"
        type="number"
        value={columns}
      />
      <DialogActions data-test-id="table-model-confirm-insert">
        <Button disabled={isDisabled} onClick={onClick}>
          Confirm
        </Button>
      </DialogActions>
    </React.Fragment>
  )
}

export type InsertTableDialogCommandPayload = Readonly<{
  columns: string
  includeHeaders?: boolean
  rows: string
}>

export const INSERT_NEW_TABLE_DIALOG_COMMAND: LexicalCommand<InsertTableDialogCommandPayload> =
  createCommand('INSERT_NEW_TABLE_DIALOG_COMMAND')

export const CREAT_NEW_TABLE_DRAWER_SLUG = 'CREATE_NEW_TABLE_DRAWER_SLUG'

export function TablePlugin({
  hasCellMerge = true,
  hasCellBackgroundColor = true,
  hasTabHandler = true,
}: {
  hasCellMerge?: boolean
  hasCellBackgroundColor?: boolean
  hasTabHandler?: boolean
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext()
  const { toggleModal } = useModal()

  useEffect(() => {
    if (!editor.hasNodes([TableNode, TableCellNode, TableRowNode])) {
      invariant(
        false,
        'TablePlugin: TableNode, TableCellNode or TableRowNode not registered on editor',
      )
    }

    return mergeRegister(
      editor.registerCommand<InsertTableCommandPayload>(
        INSERT_TABLE_COMMAND,
        ({ columns, rows, includeHeaders }) => {
          const tableNode = $createTableNodeWithDimensions(
            Number(rows),
            Number(columns),
            includeHeaders,
          )
          $insertNodeToNearestRoot(tableNode)

          const firstDescendant = tableNode.getFirstDescendant()
          if ($isTextNode(firstDescendant)) {
            firstDescendant.select()
          }

          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),

      editor.registerCommand(
        INSERT_NEW_TABLE_DIALOG_COMMAND,
        () => {
          toggleModal(CREAT_NEW_TABLE_DRAWER_SLUG)
          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    )
  }, [editor, toggleModal])

  useEffect(() => {
    const tableSelections = new Map<NodeKey, TableObserver>()

    const initializeTableNode = (tableNode: TableNode) => {
      const nodeKey = tableNode.getKey()
      const tableElement = editor.getElementByKey(
        nodeKey,
      ) as HTMLTableElementWithWithTableSelectionState
      if (tableElement && !tableSelections.has(nodeKey)) {
        const tableSelection = applyTableHandlers(tableNode, tableElement, editor, hasTabHandler)
        tableSelections.set(nodeKey, tableSelection)
      }
    }

    // Plugins might be loaded _after_ initial content is set, hence existing table nodes
    // won't be initialized from mutation[create] listener. Instead doing it here,
    editor.getEditorState().read(() => {
      const tableNodes = $nodesOfType(TableNode)
      for (const tableNode of tableNodes) {
        if ($isTableNode(tableNode)) {
          initializeTableNode(tableNode)
        }
      }
    })

    const unregisterMutationListener = editor.registerMutationListener(TableNode, nodeMutations => {
      for (const [nodeKey, mutation] of nodeMutations) {
        if (mutation === 'created') {
          editor.getEditorState().read(() => {
            const tableNode = $getNodeByKey<TableNode>(nodeKey)
            if ($isTableNode(tableNode)) {
              initializeTableNode(tableNode)
            }
          })
        } else if (mutation === 'destroyed') {
          const tableSelection = tableSelections.get(nodeKey)

          if (tableSelection !== undefined) {
            tableSelection.removeListeners()
            tableSelections.delete(nodeKey)
          }
        }
      }
    })

    return () => {
      unregisterMutationListener()
      // Hook might be called multiple times so cleaning up tables listeners as well,
      // as it'll be reinitialized during recurring call
      for (const [, tableSelection] of tableSelections) {
        tableSelection.removeListeners()
      }
    }
  }, [editor, hasTabHandler])

  // Unmerge cells when the feature isn't enabled
  useEffect(() => {
    if (hasCellMerge) {
      return
    }
    return editor.registerNodeTransform(TableCellNode, node => {
      if (node.getColSpan() > 1 || node.getRowSpan() > 1) {
        // When we have rowSpan we have to map the entire Table to understand where the new Cells
        // fit best; let's analyze all Cells at once to save us from further transform iterations
        const [, , gridNode] = $getNodeTriplet(node)
        const [gridMap] = $computeTableMap(gridNode, node, node)
        // TODO this function expects Tables to be normalized. Look into this once it exists
        const rowsCount = gridMap.length
        const columnsCount = gridMap[0].length
        let row = gridNode.getFirstChild()
        invariant($isTableRowNode(row), 'Expected TableNode first child to be a RowNode')
        const unmerged = []
        for (let i = 0; i < rowsCount; i++) {
          if (i !== 0) {
            row = row.getNextSibling()
            invariant($isTableRowNode(row), 'Expected TableNode first child to be a RowNode')
          }
          let lastRowCell: null | TableCellNode = null
          for (let j = 0; j < columnsCount; j++) {
            const cellMap = gridMap[i][j]
            const cell = cellMap.cell
            if (cellMap.startRow === i && cellMap.startColumn === j) {
              lastRowCell = cell
              unmerged.push(cell)
            } else if (cell.getColSpan() > 1 || cell.getRowSpan() > 1) {
              invariant($isTableCellNode(cell), 'Expected TableNode cell to be a TableCellNode')
              const newCell = $createTableCellNode(cell.__headerState)
              if (lastRowCell !== null) {
                lastRowCell.insertAfter(newCell)
              } else {
                $insertFirst(row, newCell)
              }
            }
          }
        }
        for (const cell of unmerged) {
          cell.setColSpan(1)
          cell.setRowSpan(1)
        }
      }
    })
  }, [editor, hasCellMerge])

  // Remove cell background color when feature is disabled
  useEffect(() => {
    if (hasCellBackgroundColor) {
      return
    }
    return editor.registerNodeTransform(TableCellNode, node => {
      if (node.getBackgroundColor() !== null) {
        node.setBackgroundColor(null)
      }
    })
  }, [editor, hasCellBackgroundColor, hasCellMerge])

  return (
    <Drawer slug={CREAT_NEW_TABLE_DRAWER_SLUG} title="Create new table">
      <InsertTableDialog activeEditor={editor} />
    </Drawer>
  )
}
