import React, { useCallback, useEffect, useState } from 'react'
import {
  $getNodeByKey,
  $getSelection,
  PASTE_COMMAND,
  COPY_COMMAND,
  KEY_DOWN_COMMAND,
  COMMAND_PRIORITY_LOW,
  $nodesOfType,
} from 'lexical'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import { $isGalleryNode, GalleryNode } from '../../nodes/GalleryNode'
import { $isGalleryImageNode } from '../../nodes/GalleryImageNode'
import { $createGalleryHandlerNode, $isGalleryHandlerNode } from '../../nodes/GalleryHandlerNode'

//https://stackoverflow.com/a/9229821
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function uniq<T>(a: Iterable<T>) {
  return Array.from(new Set(a))
}

export const GalleryComponent = () => {
  const [editor] = useLexicalComposerContext()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const appendGalleryControls = useCallback(() => {
    editor.update(() => {
      //$nodesOfType returns duplicates, don't know why
      const galleries = $nodesOfType(GalleryNode)
      const noDuplicates = uniq<GalleryNode>(galleries)

      noDuplicates.map(gallery => {
        const handlerNode = $createGalleryHandlerNode()
        const children = gallery.getChildren()
        if (children.length === 0) {
          gallery.append(handlerNode)
        } else {
          if (!children.some(child => $isGalleryHandlerNode(child))) {
            gallery.append(handlerNode)
          }
        }
      })
    })
  }, [editor])

  //add controls to existing galleries
  useEffect(() => {
    if (mounted) {
      appendGalleryControls()
    }
  }, [appendGalleryControls, editor, mounted])

  //add controls to newly created galleries
  useEffect(() => {
    editor.registerMutationListener(GalleryNode, args => {
      const values = args.values()
      let currVal
      // eslint-disable-next-line no-constant-condition
      do {
        currVal = values.next().value
        if (currVal && currVal === 'created') {
          appendGalleryControls()
        }
      } while (!values.next().done)
    })
  }, [appendGalleryControls, editor])

  //probably bugged, note that it only appends/removes className from
  // useEffect(() => {
  //   editor.registerCommand(
  //     SELECTION_CHANGE_COMMAND,
  //     () => {
  //       const galleryNodes = []

  //       editor.getEditorState().read(() => {
  //         galleryNodes.push(...$nodesOfType(GalleryNode))
  //       })

  //       editor.update(
  //         () => {
  //           if (galleryNodes.length > 0) {
  //             galleryNodes.forEach((node: GalleryNode) => {
  //               //only change node state if node exists, else error will be thrown
  //               if ($getNodeByKey(node.__key)) {
  //                 node.setIsSelected(false)
  //               }
  //             })
  //           }

  //           const selection = $getSelection()
  //           if ($isRangeSelection(selection)) {
  //             const selectedNodes = selection.getNodes()
  //             selectedNodes.forEach(node => {
  //               if ($getNodeByKey(node.__key) && $isGalleryNode(node) && !node.getIsSelected()) {
  //                 node.setIsSelected(true)
  //               } else if ($isGalleryImageNode(node)) {
  //                 const parent = node.getParent()
  //                 if ($isGalleryNode(parent) && !parent.isSelected()) {
  //                   parent.setIsSelected(true)
  //                 }
  //               }
  //             })
  //           }
  //         },
  //       )
  //       return false
  //     },
  //     COMMAND_PRIORITY_NORMAL,
  //   )
  // }, [editor])

  //prevent copy/paste, and keydown to prevent inserting/breaking gallery structure
  useEffect(() => {
    const unregister = mergeRegister(
      editor.registerCommand(
        PASTE_COMMAND,
        () => {
          const selection = $getSelection()
          const nodes = selection.getNodes()
          let handled = false
          nodes.forEach(node => {
            if ($isGalleryImageNode(node) || $isGalleryNode(node)) {
              handled = true
            }
          })
          return handled
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        COPY_COMMAND,
        () => {
          const selection = $getSelection()
          const nodes = selection.getNodes()
          let handled = false
          nodes.forEach(node => {
            if ($isGalleryImageNode(node) || $isGalleryNode(node)) {
              handled = true
            }
          })
          return handled
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        KEY_DOWN_COMMAND,
        () => {
          const selection = $getSelection()
          const nodes = selection.getNodes()
          let handled = false
          nodes.forEach(node => {
            if ($isGalleryImageNode(node) || $isGalleryNode(node)) {
              handled = true
            }
          })
          return handled
        },
        COMMAND_PRIORITY_LOW,
      ),
    )

    return () => {
      unregister()
    }
  }, [editor])

  return null
}
