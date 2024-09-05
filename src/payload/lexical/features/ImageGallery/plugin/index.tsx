import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils'
import { COMMAND_PRIORITY_EDITOR, type LexicalCommand, type NodeKey, createCommand } from 'lexical'
import { useConfig } from 'payload/components/utilities'
import React, { useEffect, useState } from 'react'
import { $createGalleryNode, GALLERY_LAYOUTS, GalleryNode } from '../nodes/GalleryNode'
import { GalleryComponent } from './component'
import './index.scss'
import { Drawer } from 'payload/dist/admin/components/elements/Drawer'
import { useModal } from '@faceless-ui/modal'
import { GalleryImageNode } from '../nodes/GalleryImageNode'
import UploadsDrawer from './drawer'

export const INSERT_GALLERY_COMMAND: LexicalCommand<unknown> =
  createCommand('INSERT_GALLERY_COMMAND')
export const OPEN_UPLOAD_DRAWER_COMMAND: LexicalCommand<NodeKey> =
  createCommand('OPEN_UPLOAD_DRAWER')
export const SELECT_MEDIA_MODAL_SLUG = 'select-image-gallery-media'
export const MEDIA_COLLECTION_SLUG = 'media'

export default function GalleryPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext()
  const { collections } = useConfig()
  const { openModal } = useModal()
  const [activeGalleryKey, setActiveGalleryKey] = useState<NodeKey>()

  const mediaCollectionConfig = collections.filter(
    collection => collection.slug === MEDIA_COLLECTION_SLUG,
  )[0]

  useEffect(() => {
    if (!editor.hasNodes([GalleryNode])) {
      throw new Error('GalleryPlugin: GalleryNode not registered on editor')
    }
    if (!editor.hasNodes([GalleryImageNode])) {
      throw new Error('GalleryPlugin: GalleryImageNode not registered on editor')
    }
    return mergeRegister(
      editor.registerCommand(
        INSERT_GALLERY_COMMAND,
        () => {
          editor.update(() => {
            const galleryNode = $createGalleryNode(GALLERY_LAYOUTS[0], 3)
            $insertNodeToNearestRoot(galleryNode)
          })
          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand(
        OPEN_UPLOAD_DRAWER_COMMAND,
        key => {
          setActiveGalleryKey(key)
          openModal(SELECT_MEDIA_MODAL_SLUG)
          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    )
  }, [editor, openModal])

  return (
    <React.Fragment>
      <GalleryComponent />
      <Drawer slug={SELECT_MEDIA_MODAL_SLUG} title="Select uploads">
        <UploadsDrawer galleryNodeKey={activeGalleryKey} collectionConfig={mediaCollectionConfig} />
      </Drawer>
    </React.Fragment>
  )
}
