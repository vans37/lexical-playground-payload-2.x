import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import {
  $getNodeByKey,
  COMMAND_PRIORITY_HIGH,
  DRAGSTART_COMMAND,
  DRAGOVER_COMMAND,
  DROP_COMMAND,
} from 'lexical'
import React, { useEffect } from 'react'
import { $isGalleryNode, GalleryNode } from '../nodes/GalleryNode'
import './index.scss'

export function findAncestorWithAttribute(element: HTMLElement | Element, attribute: string) {
  while (element && element !== document.body) {
    if (element.hasAttribute(attribute)) {
      return element
    }
    element = element.parentElement
  }
  return null
}

export default function GalleryReorderPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([GalleryNode])) {
      throw new Error('GalleryImageReorderPlugin: GalleryNode not registered on editor')
    }

    const handleDragStart = (event: DragEvent) => {
      const target = event.target as HTMLElement
      const nodeKey = target?.parentElement?.getAttribute('node-key')
      if (nodeKey) {
        event.dataTransfer?.setData('text/plain', nodeKey)
      }
      return true
    }

    const handleDragOver = (event: DragEvent) => {
      event.preventDefault()
      return true
    }

    const handleDrop = (event: DragEvent) => {
      event.preventDefault()
      const dropTarget = event.target as HTMLElement
      const draggedImageKey = event.dataTransfer?.getData('text/plain')
      let dropTargetKey: string | null = null

      if (dropTarget) {
        dropTargetKey = findAncestorWithAttribute(dropTarget, 'node-key')?.getAttribute('node-key')
      } else {
        return false
      }

      editor.update(() => {
        const galleryNodeKey = findAncestorWithAttribute(dropTarget, 'data-node-key')?.getAttribute(
          'data-node-key',
        )
        if (galleryNodeKey && draggedImageKey) {
          const galleryNode = $getNodeByKey(galleryNodeKey)
          if (galleryNode && $isGalleryNode(galleryNode)) {
            const draggedImageNode = $getNodeByKey(draggedImageKey)
            const draggedIndex = galleryNode
              .getChildren()
              .findIndex(child => child.getKey() === draggedImageKey)
            const dropTargetIndex = galleryNode
              .getChildren()
              .findIndex(child => child.getKey() === dropTargetKey)
            if (draggedIndex !== -1 && dropTargetIndex !== -1) {
              const children = galleryNode.getChildren()
              children.splice(draggedIndex, 1)
              children.splice(dropTargetIndex, 0, draggedImageNode)
              children.map(child => galleryNode.append(child))
            }
          }
        }
      })

      return true
    }

    return mergeRegister(
      editor.registerCommand<DragEvent>(
        DRAGSTART_COMMAND,
        event => {
          return handleDragStart(event)
        },
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerCommand<DragEvent>(
        DRAGOVER_COMMAND,
        event => {
          return handleDragOver(event)
        },
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerCommand<DragEvent>(
        DROP_COMMAND,
        event => {
          return handleDrop(event)
        },

        COMMAND_PRIORITY_HIGH,
      ),
    )
  }, [editor])

  return null
}
