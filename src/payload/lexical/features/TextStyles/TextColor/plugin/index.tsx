/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import * as React from 'react'

import { $patchStyleText } from '@lexical/selection'

import { $getSelection, createCommand, COMMAND_PRIORITY_EDITOR } from 'lexical'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import type { LexicalCommand } from 'lexical'
import { useCallback, useEffect, useState } from 'react'
import Modal from '../../../../lib/ui/Modal'
import ColorPicker from '../../../../lib/ui/ColorPicker'

export const OPEN_COLOR_PICKER_COMMAND: LexicalCommand<boolean> = createCommand()

export function TextColorPlugin(): React.ReactNode {
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
      <Modal closeOnClickOutside onClose={() => setIsModalOpen(false)} title="Change text color">
        <ColorPicker onChange={onFontColorSelect} color="#555" />
      </Modal>
    )
  }

  return null
}
