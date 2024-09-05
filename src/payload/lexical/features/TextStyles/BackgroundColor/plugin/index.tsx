/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import * as React from 'react'

import { $isDecoratorBlockNode } from '@lexical/react/LexicalDecoratorBlockNode'

import { $isHeadingNode, $isQuoteNode } from '@lexical/rich-text'
import { $patchStyleText } from '@lexical/selection'
import { $isTableSelection } from '@lexical/table'
import { $getNearestBlockElementAncestorOrThrow } from '@lexical/utils'
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  createCommand,
  COMMAND_PRIORITY_EDITOR,
} from 'lexical'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import type { LexicalCommand } from 'lexical'
import { useCallback, useEffect, useState } from 'react'
import Modal from '../../../../lib/ui/Modal'
import ColorPicker from '../../../../lib/ui/ColorPicker'

export const OPEN_COLOR_PICKER_COMMAND: LexicalCommand<boolean> = createCommand()

export function TextStylesPlugin(): React.ReactNode {
  const [editor] = useLexicalComposerContext()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const applyStyleText = useCallback(
    (styles: Record<string, string>, skipHistoryStack?: boolean) => {
      editor.update(
        () => {
          const selection = $getSelection()
          if (selection !== null) {
            $patchStyleText(selection, styles)
          }
        },
        skipHistoryStack ? { tag: 'historic' } : {},
      )
    },
    [editor],
  )

  const clearFormatting = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection) || $isTableSelection(selection)) {
        const anchor = selection.anchor
        const focus = selection.focus
        const nodes = selection.getNodes()
        const extractedNodes = selection.extract()

        if (anchor.key === focus.key && anchor.offset === focus.offset) {
          return
        }

        nodes.forEach((node, idx) => {
          // We split the first and last node by the selection
          // So that we don't format unselected text inside those nodes
          if ($isTextNode(node)) {
            // Use a separate variable to ensure TS does not lose the refinement
            let textNode = node
            if (idx === 0 && anchor.offset !== 0) {
              textNode = textNode.splitText(anchor.offset)[1] || textNode
            }
            if (idx === nodes.length - 1) {
              textNode = textNode.splitText(focus.offset)[0] || textNode
            }
            /**
             * If the selected text has one format applied
             * selecting a portion of the text, could
             * clear the format to the wrong portion of the text.
             *
             * The cleared text is based on the length of the selected text.
             */
            // We need this in case the selected text only has one format
            const extractedTextNode = extractedNodes[0]
            if (nodes.length === 1 && $isTextNode(extractedTextNode)) {
              textNode = extractedTextNode
            }

            if (textNode.__style !== '') {
              textNode.setStyle('')
            }
            if (textNode.__format !== 0) {
              textNode.setFormat(0)
              $getNearestBlockElementAncestorOrThrow(textNode).setFormat('')
            }
            node = textNode
          } else if ($isHeadingNode(node) || $isQuoteNode(node)) {
            node.replace($createParagraphNode(), true)
          } else if ($isDecoratorBlockNode(node)) {
            node.setFormat('')
          }
        })
      }
    })
  }, [editor])

  const onBgColorSelect = useCallback(
    (value: string, skipHistoryStack: boolean) => {
      applyStyleText({ 'background-color': value }, skipHistoryStack)
    },
    [applyStyleText],
  )

  const onFontColorSelect = useCallback(
    (value: string, skipHistoryStack: boolean) => {
      applyStyleText({ color: value }, skipHistoryStack)
    },
    [applyStyleText],
  )

  useEffect(() => {
    editor.registerCommand(
      OPEN_COLOR_PICKER_COMMAND,
      args => {
        setIsModalOpen(true)
        return true
      },
      COMMAND_PRIORITY_EDITOR,
    )
  }, [editor])

  if (isModalOpen) {
    return (
      <Modal
        closeOnClickOutside
        onClose={() => setIsModalOpen(false)}
        title="Change text background"
      >
        <ColorPicker onChange={onBgColorSelect} color="#555" />
      </Modal>
    )
  }

  return null
}