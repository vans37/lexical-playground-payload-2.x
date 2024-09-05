/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { LexicalEditor } from 'lexical'
import { exportFile, importFile } from '../lexical-file'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'

import { CLEAR_EDITOR_COMMAND } from 'lexical'
import * as React from 'react'
import { useState } from 'react'

import useModal from '../../../lib/hooks/useModal'
import Button from '../../../lib/ui/Button'
import { SPEECH_TO_TEXT_COMMAND, SUPPORT_SPEECH_RECOGNITION } from '../SpeechToText'
import { useField } from 'payload/components/forms'
import type { SerializedEditorState } from 'lexical'
import { useEditorConfigContext } from '@payloadcms/richtext-lexical'

export default function ActionsPlugin({ isRichText }: { isRichText: boolean }): JSX.Element {
  const [editor] = useLexicalComposerContext()
  const [isSpeechToText, setIsSpeechToText] = useState(false)

  const [modal, showModal] = useModal()

  /* 
    Replace all buttons with divs, 
    somehow if action options are buttons,
    clicking on them will cause current document to be saved
  */
  return (
    <div className="actions">
      {SUPPORT_SPEECH_RECOGNITION && (
        <div
          onClick={() => {
            editor.dispatchCommand(SPEECH_TO_TEXT_COMMAND, !isSpeechToText)
            setIsSpeechToText(!isSpeechToText)
          }}
          className={'action-button action-button-mic ' + (isSpeechToText ? 'active' : '')}
          title="Speech To Text"
          aria-label={`${isSpeechToText ? 'Enable' : 'Disable'} speech to text`}
        >
          <i className="mic" />
        </div>
      )}
      <div
        className="action-button import"
        onClick={() => importFile(editor)}
        title="Import"
        aria-label="Import editor state from JSON"
      >
        <i className="import" />
      </div>
      <div
        className="action-button export"
        onClick={() =>
          exportFile(editor, {
            fileName: `Playground ${new Date().toISOString()}`,
            source: 'Playground',
          })
        }
        title="Export"
        aria-label="Export editor state to JSON"
      >
        <i className="export" />
      </div>
      <div
        className="action-button clear"
        // disabled={isEditorEmpty}
        onClick={() => {
          showModal('Clear editor', onClose => (
            <ShowClearDialog editor={editor} onClose={onClose} />
          ))
        }}
        title="Clear"
        aria-label="Clear editor contents"
      >
        <i className="clear" />
      </div>
      {modal}
    </div>
  )
}

function ShowClearDialog({
  editor,
  onClose,
}: {
  editor: LexicalEditor
  onClose: () => void
}): JSX.Element {
  const config = useEditorConfigContext()
  const { setValue, value } = useField<SerializedEditorState>({ path: config.field.path })

  const emptyStateValue = {
    root: {
      direction: null,
      format: '',
      indent: 0,
      type: 'root',
      version: 0,
      children: [
        {
          children: [],
          direction: null,
          format: '',
          indent: 0,
          type: 'paragraph',
          version: 0,
        },
      ],
    },
  }

  return (
    <>
      Are you sure you want to clear the editor?
      <div className="Modal__content">
        <Button
          onClick={() => {
            editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined)
            setValue(emptyStateValue)
            editor.focus()
            onClose()
          }}
        >
          Clear
        </Button>{' '}
        <Button
          onClick={() => {
            editor.focus()
            onClose()
          }}
        >
          Cancel
        </Button>
      </div>
    </>
  )
}
