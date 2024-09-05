/* eslint-disable jsx-a11y/label-has-associated-control */
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import React, { memo, useEffect, useRef, useState } from 'react'

import type { GalleryLayouts } from './GalleryNode'
import { $isGalleryNode, GALLERY_LAYOUTS, GalleryNode } from './GalleryNode'
import { $getNearestNodeOfType } from '@lexical/utils'
import type { NodeKey } from 'lexical'
import { $getNodeByKey, $createParagraphNode } from 'lexical'
import { $isGalleryHandlerNode } from './GalleryHandlerNode'
import { Button } from 'payload/components/elements'
import { useGallery } from '../plugin/store'
import GalleryNodesHandler from '../plugin/component/Handler'
import { $isGalleryImageNode } from './GalleryImageNode'
import { findAncestorWithAttribute } from '../plugin/Reorder'
import { useModal } from '@faceless-ui/modal'

const GALLERY_COLUMNS = Array.from({ length: 10 }, (_, i) => i + 1)

const GalleryHandlerComponent = ({ nodeKey }: { nodeKey: NodeKey }) => {
  const [editor] = useLexicalComposerContext()
  const controlsWrapperRef = useRef<HTMLDivElement>(null)
  const galleryNodeKeyRef = useRef<NodeKey>('')
  const galleryNodeRef = useRef<GalleryNode>(null)
  const [galleryLayout, setGalleryLayout] = useState<GalleryLayouts>('columns')
  const [galleryColumns, setGalleryColumns] = useState<number>(3)
  const [isExpanded, setIsExpanded] = useState(false)
  const { toggleModal: toggleSelectDrawer } = useModal()
  const { clearSelection, clearFiles } = useGallery(galleryNodeKeyRef.current)

  useEffect(() => {
    editor.getEditorState().read(() => {
      const handlerNode = $getNodeByKey(nodeKey)
      if (handlerNode && $isGalleryHandlerNode(handlerNode)) {
        const galleryNode = $getNearestNodeOfType(handlerNode, GalleryNode)
        if (galleryNode && $isGalleryNode(galleryNode)) {
          galleryNodeKeyRef.current = galleryNode.__key
          galleryNodeRef.current = galleryNode
          setGalleryLayout(galleryNode.getGalleryLayout())
          setGalleryColumns(galleryNode.getColumns())
        }
      }
    })
  }, [editor, nodeKey])

  //change gallery controls position on scroll
  useEffect(() => {
    if (controlsWrapperRef.current) {
      const gallery = findAncestorWithAttribute(controlsWrapperRef.current, 'data-node-key')
      const controls = controlsWrapperRef.current.parentElement

      const updateControlsPosition = () => {
        controls.style.top = `${gallery.scrollTop + 16}px`
      }

      gallery.addEventListener('scroll', updateControlsPosition)
      return () => {
        gallery.removeEventListener('scroll', updateControlsPosition)
      }
    }
  })

  const handleModalToggle = () => {
    //toggleModal(galleryNodeKeyRef.current)
    if (galleryNodeKeyRef.current) {
      toggleSelectDrawer(galleryNodeKeyRef.current)
    }
  }

  const handleClearImages = () => {
    if (galleryNodeKeyRef.current) {
      editor.update(() => {
        const gallery = $getNodeByKey(galleryNodeKeyRef.current)
        if ($isGalleryNode(gallery)) {
          const children = gallery.getChildren()
          children.forEach(child => {
            if ($isGalleryImageNode(child)) {
              child.remove()
            }
          })
          clearSelection()
          clearFiles()
        }
      })
    }
  }

  const handleDeleteImages = () => {
    if (galleryNodeKeyRef.current) {
      editor.update(() => {
        const gallery = $getNodeByKey(galleryNodeKeyRef.current)
        if ($isGalleryNode(gallery)) {
          gallery.remove()
        }
      })
    }
  }

  const handleAppendBefore = () => {
    if (galleryNodeKeyRef.current) {
      editor.update(() => {
        const gallery = $getNodeByKey(galleryNodeKeyRef.current)
        if ($isGalleryNode(gallery)) {
          gallery.insertBefore($createParagraphNode())
        }
      })
    }
  }

  const handleAppendAfter = () => {
    if (galleryNodeKeyRef.current) {
      editor.update(() => {
        const gallery = $getNodeByKey(galleryNodeKeyRef.current)
        if ($isGalleryNode(gallery)) {
          gallery.insertAfter($createParagraphNode())
        }
      })
    }
  }

  const handleLayoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    editor.update(() => {
      if (galleryNodeRef.current) {
        galleryNodeRef.current.setGalleryLayout(e.target.value as GalleryLayouts)
        setGalleryLayout(e.target.value as GalleryLayouts)
      }
    })
  }

  const handleColumnsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    editor.update(() => {
      if (galleryNodeRef.current) {
        const cols = parseInt(e.target.value)
        if (!isNaN(cols)) {
          galleryNodeRef.current.setColumns(cols)
          setGalleryColumns(cols)
        }
      }
    })
  }

  return (
    <React.Fragment>
      <div ref={controlsWrapperRef} className="controls-wrapper">
        <Button onClick={handleModalToggle}>Add images</Button>
        <Button
          className={`collapsible-btn ${isExpanded ? 'expanded' : ''}`}
          onClick={() => setIsExpanded(prev => !prev)}
        />
        <div className={`expandable-controls ${isExpanded ? 'expanded' : ''}`}>
          <Button onClick={handleClearImages}>Clear images</Button>
          <Button onClick={handleDeleteImages}>Delete Gallery</Button>
          <Button onClick={handleAppendBefore}>Append p node before</Button>
          <Button onClick={handleAppendAfter}>Append p node after</Button>
          <div className="inputs">
            <label htmlFor={`layout-${nodeKey}`}>Layout:</label>
            <select id={`layout-${nodeKey}`} value={galleryLayout} onChange={handleLayoutChange}>
              {GALLERY_LAYOUTS.map((layout, index) => (
                <option key={index} value={layout}>
                  {layout}
                </option>
              ))}
            </select>

            {galleryLayout !== 'rows' && (
              <React.Fragment>
                <label htmlFor={`columns-${nodeKey}`}>Columns:</label>
                <select
                  id={`columns-${nodeKey}`}
                  value={galleryColumns}
                  onChange={handleColumnsChange}
                >
                  {GALLERY_COLUMNS.map((col, index) => {
                    return (
                      <option value={col} key={index}>
                        {col}
                      </option>
                    )
                  })}
                </select>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
      <MemoizedHandler nodeKey={galleryNodeKeyRef.current} />
    </React.Fragment>
  )
}

const MemoizedHandler = memo(({ nodeKey }: { nodeKey: string }) => (
  <GalleryNodesHandler nodeKey={nodeKey} />
))

export default GalleryHandlerComponent
