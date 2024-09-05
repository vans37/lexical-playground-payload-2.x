/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { EditorState, LexicalEditor } from 'lexical'

import { CLEAR_HISTORY_COMMAND } from 'lexical'

import type { Media } from '../../../../../payload-types'
import type { SerializedImageNode } from '../../Images/nodes/ImageNode'

import adminRequest from '../../../lib/api/adminRequest'
import { toDataURL } from '../../UploadImages/utils'

const version = '0.13.1'

/**
 * Takes a file and inputs its content into the editor state as an input field.
 * @param editor - The lexical editor.
 */
export function importFile(editor: LexicalEditor) {
  readTextFileFromSystem(text => {
    const json = JSON.parse(text)
    const editorState = editor.parseEditorState(JSON.stringify(json.editorState))
    editor.setEditorState(editorState)
    editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined)
  })
}

function readTextFileFromSystem(callback: (text: string) => void) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.lexical'
  input.addEventListener('change', (event: Event) => {
    const target = event.target as HTMLInputElement

    if (target.files) {
      const file = target.files[0]
      const reader = new FileReader()
      reader.readAsText(file, 'UTF-8')

      reader.onload = readerEvent => {
        if (readerEvent.target) {
          const content = readerEvent.target.result
          callback(content as string)
        }
      }
    }
  })
  input.click()
}

type DocumentJSON = {
  editorState: EditorState
  lastSaved: number
  source: 'Lexical' | string
  version: typeof version
}

/**
 * Generates a .lexical file to be downloaded by the browser containing the current editor state.
 * @param editor - The lexical editor.
 * @param config - An object that optionally contains fileName and source. fileName defaults to
 * the current date (as a string) and source defaults to lexical.
 */

export async function exportFile(
  editor: LexicalEditor,
  config: Readonly<{
    fileName?: string
    source?: string
  }> = Object.freeze({}),
) {
  const now = new Date()
  let editorState = editor.getEditorState()

  // Convert all uploaded images back to base64
  const serializedState = editorState.toJSON()

  async function traverse(node) {
    // Transform only images that are uploaded to the media collection
    if (node.type === 'image' && node.isWebUploadable) {
      const currNode = node as SerializedImageNode

      if (currNode.id) {
        try {
          const data = await adminRequest<Media>(`/api/media/${currNode.id}`)
          const url = data.url

          if (url) {
            const base64 = (await toDataURL(url)) as string
            //reupload images
            node.id = null
            node.src = base64
            node.isWebUploadable = true
          }
        } catch (err) {
          console.log(err)
        }
      }
    }

    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        await traverse(child)
      }
    }
  }

  if (serializedState?.root?.children?.length > 0) {
    await traverse(serializedState.root)
    const newEditorState = editor.parseEditorState(serializedState)
    editorState = newEditorState
  }

  const documentJSON: DocumentJSON = {
    editorState,
    lastSaved: now.getTime(),
    source: config.source || 'Lexical',
    version,
  }
  const fileName = config.fileName || now.toISOString()
  exportBlob(documentJSON, `${fileName}.lexical`)
}

// Adapted from https://stackoverflow.com/a/19328891/2013580
function exportBlob(data: DocumentJSON, fileName: string) {
  const a = document.createElement('a')
  const body = document.body

  if (body === null) {
    return
  }

  body.appendChild(a)
  a.style.display = 'none'
  const json = JSON.stringify(data)
  const blob = new Blob([json], {
    type: 'octet/stream',
  })
  const url = window.URL.createObjectURL(blob)
  a.href = url
  a.download = fileName
  a.click()
  window.URL.revokeObjectURL(url)
  a.remove()
}
