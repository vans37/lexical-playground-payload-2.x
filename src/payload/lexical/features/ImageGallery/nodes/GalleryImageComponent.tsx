/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type { BaseSelection, LexicalCommand, LexicalEditor, NodeKey } from 'lexical'
import './ImageNode.css'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { mergeRegister } from '@lexical/utils'
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  $setSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DRAGSTART_COMMAND,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from 'lexical'
import * as React from 'react'
import { Suspense, useCallback, useEffect, useRef, useState, forwardRef } from 'react'
import type { GalleryImageNode } from './GalleryImageNode'
import { $isGalleryImageNode } from './GalleryImageNode'
import { useEditorConfigContext } from '@payloadcms/richtext-lexical'
import { useGallery } from '../plugin/store'
import { findAncestorWithAttribute } from '../plugin/Reorder'
import { $isGalleryNode } from './GalleryNode'

export const RIGHT_CLICK_IMAGE_COMMAND: LexicalCommand<MouseEvent> = createCommand(
  'RIGHT_CLICK_IMAGE_COMMAND',
)

//if image was uploaded from dev machine (e.g http://localhost:3000)
//in production all images will not be available in the editor unless origin is replaced
//with production payload url
//this will not replace uploaded image url in database

const replaceSrcOrigin = (src: string, origin: string) => {
  if (!src || src.length === 0 || !src.startsWith('http')) {
    return src
  }

  const url = new URL(src)
  const urlOrigin = url.origin
  const newSrc = url.toString().replace(urlOrigin, origin)

  return newSrc
}

const DecoratorImage = forwardRef<
  HTMLImageElement,
  {
    altText: string
    className: string | null
    height: 'inherit' | number
    maxWidth: number
    src: string
    width: 'inherit' | number
  }
>(function ImageComponent({ altText, className, src, width, height, maxWidth }, ref): JSX.Element {
  //don't use lazy image, it will defer setting image ref
  //and will cause some initial interactions like deletion
  //not to work
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className || undefined}
      src={src}
      alt={altText}
      ref={ref}
      style={{
        height,
        maxWidth,
        width,
      }}
      draggable="false"
    />
  )
})

//this is a modification of playgound image node
export default function GalleryImageComponent({
  src,
  altText,
  nodeKey,
  width,
  height,
  maxWidth,
  showCaption,
  caption,
  id,
}: {
  altText: string
  caption: string
  height: 'inherit' | number
  maxWidth: number
  nodeKey: NodeKey
  showCaption: boolean
  src: string
  width: 'inherit' | number
  id: number | undefined
}): JSX.Element {
  const imageRef = useRef<null | HTMLImageElement>(null)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey)

  const [editor] = useLexicalComposerContext()
  const [selection, setSelection] = useState<BaseSelection | null>(null)
  const activeEditorRef = useRef<LexicalEditor | null>(null)
  const [imgSrc, setImgSrc] = useState(src)
  const [captionText, setCaptionText] = useState(caption)
  const [editCaption, setEditCaption] = useState(!showCaption)
  const [showAddCaptionBtn, setShowAddCaptionBtn] = useState(!showCaption)
  const [galleryKey, setGalleryKey] = useState<NodeKey>('')
  const {
    setSelection: setGallerySelection,
    deleteSelection,
    deleteFile,
    setShouldInsertMedia,
  } = useGallery(galleryKey)

  const { editorConfig } = useEditorConfigContext()
  //@ts-expect-error
  const origin = useRef(editorConfig?.resolvedFeatureMap?.get('images')?.props?.origin)

  useEffect(() => {
    if (id && !isNaN(id)) {
      const src = replaceSrcOrigin(imgSrc, origin.current)
      setImgSrc(src)
    }
  }, [id, imgSrc, src])

  //set gallery key to use zustand store
  useEffect(() => {
    if (imageRef.current) {
      const gallery = findAncestorWithAttribute(imageRef.current, 'data-node-key')
      if (gallery) {
        const galleryNodeKey = gallery.getAttribute('data-node-key')
        if (galleryNodeKey) {
          setGalleryKey(galleryNodeKey)
        }
      }
    }
  }, [])

  //add this node to selection
  useEffect(() => {
    if (galleryKey.length > 0) {
      editor.getEditorState().read(() => {
        const gallery = $getNodeByKey(galleryKey)
        if (gallery && $isGalleryNode(gallery)) {
          const nodeExists = gallery
            .getChildren()
            .some((child: GalleryImageNode) => child.__id === id)
          if (id && nodeExists) {
            setGallerySelection([id])
          }
        }
      })
    }
  }, [editor, galleryKey, id, setGallerySelection])

  //if its an upload, delete selection then node
  //else delete a file then node
  const handleDelete = useCallback(() => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isGalleryImageNode(node)) {
        const id = node.getId()
        if (id !== null && galleryKey) {
          deleteSelection(id)
          setShouldInsertMedia(true)
          node.remove()
        } else {
          if (galleryKey) {
            deleteFile(node.getSrc())
            node.remove()
          }
        }
        return true
      }
    })
  }, [deleteFile, deleteSelection, editor, galleryKey, nodeKey, setShouldInsertMedia])

  //delete via escape/delete key
  const onDelete = useCallback(
    (payload: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        const event: KeyboardEvent = payload
        event.preventDefault()
        const node = $getNodeByKey(nodeKey)
        if ($isGalleryImageNode(node)) {
          const id = node.getId()
          if (id !== null) {
            deleteSelection(node.getId())
            node.remove()
          } else {
            if (galleryKey) {
              deleteFile(node.getSrc())
              node.remove()
            }
          }
          return true
        }
      }
      return false
    },
    [isSelected, nodeKey, deleteSelection, galleryKey, deleteFile],
  )

  const onEnter = useCallback(
    (event: KeyboardEvent) => {
      const latestSelection = $getSelection()
      const buttonElem = buttonRef.current
      if (
        isSelected &&
        $isNodeSelection(latestSelection) &&
        latestSelection.getNodes().length === 1
      ) {
        if (showCaption) {
          // Move focus into nested editor
          // $setSelection(null)
          // event.preventDefault()
          // caption.focus()
          // return true
        } else if (buttonElem !== null && buttonElem !== document.activeElement) {
          event.preventDefault()
          buttonElem.focus()
          return true
        }
      }
      return false
    },
    [isSelected, showCaption],
  )

  const onEscape = useCallback(
    (event: KeyboardEvent) => {
      if (buttonRef.current === event.target) {
        $setSelection(null)
        editor.update(() => {
          setSelected(true)
          const parentRootElement = editor.getRootElement()
          if (parentRootElement !== null) {
            parentRootElement.focus()
          }
        })
        return true
      }
      return false
    },
    [editor, setSelected],
  )

  const onClick = useCallback(
    (payload: MouseEvent) => {
      const event = payload

      if (event.target === imageRef.current) {
        if (event.shiftKey) {
          setSelected(!isSelected)
        } else {
          clearSelection()
          setSelected(true)
        }
        return true
      }

      return false
    },
    [isSelected, setSelected, clearSelection],
  )

  const onRightClick = useCallback(
    (event: MouseEvent): void => {
      editor.getEditorState().read(() => {
        const latestSelection = $getSelection()
        const domElement = event.target as HTMLElement
        if (
          domElement.tagName === 'IMG' &&
          $isRangeSelection(latestSelection) &&
          latestSelection.getNodes().length === 1
        ) {
          editor.dispatchCommand(RIGHT_CLICK_IMAGE_COMMAND, event)
        }
      })
    },
    [editor],
  )

  useEffect(() => {
    let isMounted = true
    const rootElement = editor.getRootElement()
    const unregister = mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        if (isMounted) {
          setSelection(editorState.read(() => $getSelection()))
        }
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_, activeEditor) => {
          activeEditorRef.current = activeEditor
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<MouseEvent>(CLICK_COMMAND, onClick, COMMAND_PRIORITY_LOW),
      editor.registerCommand<MouseEvent>(RIGHT_CLICK_IMAGE_COMMAND, onClick, COMMAND_PRIORITY_LOW),
      editor.registerCommand(
        DRAGSTART_COMMAND,
        event => {
          if (event.target === imageRef.current) {
            // TODO This is just a temporary workaround for FF to behave like other browsers.
            // Ideally, this handles drag & drop too (and all browsers).
            event.preventDefault()
            return true
          }
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ENTER_COMMAND, onEnter, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_ESCAPE_COMMAND, onEscape, COMMAND_PRIORITY_LOW),
    )

    rootElement?.addEventListener('contextmenu', onRightClick)

    return () => {
      isMounted = false
      unregister()
      rootElement?.removeEventListener('contextmenu', onRightClick)
    }
  }, [editor, onClick, onDelete, onEnter, onEscape, onRightClick])

  const setShowCaption = (show: boolean) => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isGalleryImageNode(node)) {
        node.setShowCaption(show)
      }
    })
  }

  const draggable = isSelected && $isNodeSelection(selection)
  const isFocused = isSelected

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCaptionText(e.currentTarget.value)
  }

  const setCaption = () => {
    if (captionText?.length === 0) {
      editor.update(
        () => {
          const node = $getNodeByKey(nodeKey)
          if ($isGalleryImageNode(node)) {
            node.setCaption('')
            setShowCaption(false)
            setShowAddCaptionBtn(true)
            setEditCaption(false)
          }
        },
        { discrete: true },
      )
    } else {
      editor.update(
        () => {
          const node = $getNodeByKey(nodeKey)
          if ($isGalleryImageNode(node)) {
            node.setCaption(captionText)
            setShowAddCaptionBtn(false)
            setShowCaption(true)
            setEditCaption(false)
          }
        },
        { discrete: true },
      )
    }
  }

  const handleSetCaption = () => {
    setCaption()
  }

  const handleClearCaption = () => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if ($isGalleryImageNode(node)) {
        node.setCaption('')
        setCaptionText('')
        setShowCaption(false)
        setShowAddCaptionBtn(true)
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key == 'Enter' && captionText?.length > 0) {
      setCaption()
    }
  }

  //no need to use resizing
  return (
    <Suspense fallback={null}>
      <React.Fragment>
        <div draggable={draggable}>
          <DecoratorImage
            className={
              isFocused ? `focused ${$isNodeSelection(selection) ? 'draggable' : ''}` : null
            }
            src={imgSrc}
            altText={altText}
            ref={imageRef}
            width={width}
            height={height}
            maxWidth={maxWidth}
          />
        </div>
        {/* delete button */}
        <div
          aria-label="delete"
          tabIndex={0}
          role="button"
          onKeyDown={e => {
            if (e.key == 'Enter') {
              handleDelete()
            }
          }}
          onClick={handleDelete}
          style={{
            position: 'absolute',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            top: '1rem',
            right: '1rem',
            width: '2rem',
            height: '2rem',
            borderRadius: '100%',
            background: '#000',
            color: '#FFF',
          }}
        >
          &#10006;
        </div>
        {/* handle captions, note that only basic text can be 
        a caption, we don't use nested editor here for the ease of use
        */}
        {captionText?.length > 0 && showCaption && !editCaption && (
          <div
            tabIndex={0}
            aria-label="edit caption text"
            role="button"
            onKeyDown={e => {
              if (e.key === 'enter') {
                setEditCaption(true)
              }
            }}
            onClick={() => setEditCaption(true)}
            style={{
              cursor: 'pointer',
              position: 'absolute',
              bottom: '8px',
              left: '4px',
              background: 'rgba(0, 0, 0, 1)',
              color: '#FFF',
              padding: '4px 8px',
              fontWeight: 'bolder',
            }}
          >
            {captionText}
          </div>
        )}
        {!showAddCaptionBtn && editCaption && (
          <div className="image-edit-caption">
            <div style={{ position: 'relative', width: '100%', height: '3rem' }}>
              <input
                type="text"
                onKeyDown={e => handleKeyDown(e)}
                onChange={e => handleChange(e)}
                value={captionText}
                style={{
                  width: '100%',
                  height: 'inherit',
                }}
              />
              {(!captionText || captionText?.length === 0) && (
                <div
                  tabIndex={0}
                  role="button"
                  aria-label="edit caption"
                  onKeyDown={e => {
                    if (e.key === 'enter') {
                      setShowAddCaptionBtn(true)
                    }
                  }}
                  onClick={() => {
                    setShowAddCaptionBtn(true)
                  }}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: 0,
                    cursor: 'pointer',
                    width: '1.5rem',
                    height: '3rem',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'rgba(220, 30, 45, 0.7)',
                  }}
                >
                  &#215;
                </div>
              )}

              {captionText?.length > 0 && (
                <React.Fragment>
                  <div
                    tabIndex={0}
                    role="button"
                    aria-label="set caption"
                    onKeyDown={e => {
                      if (e.key == 'enter') {
                        handleSetCaption()
                      }
                    }}
                    onClick={handleSetCaption}
                    style={{
                      position: 'absolute',
                      right: '3.25rem',
                      top: 0,
                      cursor: 'pointer',
                      width: '1.5rem',
                      height: '3rem',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: 'rgba(30, 220, 45, 0.7)',
                    }}
                  >
                    &#10003;
                  </div>
                  <div
                    tabIndex={0}
                    role="button"
                    aria-label="clear caption"
                    onKeyDown={e => {
                      if (e.key == 'enter') {
                        handleClearCaption()
                      }
                    }}
                    onClick={handleClearCaption}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: 0,
                      cursor: 'pointer',
                      width: '1.5rem',
                      height: '3rem',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: 'rgba(220, 30, 45, 0.7)',
                    }}
                  >
                    &#10005;
                  </div>
                </React.Fragment>
              )}
            </div>
          </div>
        )}
        {isFocused && showAddCaptionBtn && (
          <div>
            <div
              tabIndex={0}
              role="button"
              aria-label="add caption"
              className="image-caption-button"
              onKeyDown={e => {
                if (e.key == 'enter') {
                  setShowAddCaptionBtn(false)
                }
              }}
              onClick={() => {
                setShowAddCaptionBtn(false)
              }}
            >
              Add Caption
            </div>
          </div>
        )}
      </React.Fragment>
    </Suspense>
  )
}
