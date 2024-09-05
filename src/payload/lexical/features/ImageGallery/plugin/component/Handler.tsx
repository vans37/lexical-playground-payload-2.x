import React, { useEffect, useRef } from 'react'
import type { NodeKey } from 'lexical'
import { $getNodeByKey } from 'lexical'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { isMimeType, mediaFileReader } from '@lexical/utils'
import type { GalleryNode } from '../../nodes/GalleryNode'
import { $isGalleryNode } from '../../nodes/GalleryNode'
import { toast } from 'react-toastify'
import { useGallery } from '../store'
import SelectImageModal from './SelectImageModal'
import { $createGalleryImageNode, $isGalleryImageNode } from '../../nodes/GalleryImageNode'
import { OPEN_UPLOAD_DRAWER_COMMAND } from '..'
import type { Media } from '../../../../../../payload-types'
import type { GalleryImageNode } from '../../nodes/GalleryImageNode'
import adminRequest from '../../../../lib/api/adminRequest'
import { useConfig } from 'payload/components/utilities'
import { MEDIA_COLLECTION_SLUG } from '../index'
import { useCallback } from 'react'
import { useModal } from '@faceless-ui/modal'

const ACCEPTABLE_IMAGE_TYPES = ['image/', 'image/heic', 'image/heif', 'image/gif', 'image/webp']

export type FileWithResult = {
  result: string
  file: File
}

const GalleryNodesHandler = ({ nodeKey }: { nodeKey: NodeKey }) => {
  const [editor] = useLexicalComposerContext()
  const { serverURL } = useConfig()
  const { selection, shouldInsertMedia, setShouldInsertMedia, files, setFiles } =
    useGallery(nodeKey)
  const { toggleModal } = useModal()

  const dropZoneRef = useRef(null)

  const getMedia = useCallback(
    async (id: number) => {
      try {
        return await adminRequest<Media>(`${serverURL}/api/${MEDIA_COLLECTION_SLUG}/${id}`)
      } catch (err) {
        console.log(err)
      }
    },
    [serverURL],
  )

  const getMediaMultiple = useCallback(
    async (ids: number[]) => {
      try {
        const mediaPromises = ids.map(id => {
          return getMedia(id)
        })
        const media = await Promise.all(mediaPromises)
        return media
      } catch (err) {
        console.log(err)
      }
    },
    [getMedia],
  )

  const getUploadNodesCount = useCallback(() => {
    let count = 0
    editor.getEditorState().read(() => {
      const galleryNode = $getNodeByKey(nodeKey)
      if (galleryNode && $isGalleryNode(galleryNode)) {
        const children = galleryNode.getChildren()
        for (let i = 0; i < children.length; i++) {
          const upload = children[i]
          if ($isGalleryImageNode(upload) && !isNaN(upload.getId())) {
            count++
          }
        }
      }
    })
    return count
  }, [editor, nodeKey])

  const checkUploadNodeExists = useCallback(
    (id: number) => {
      let flag = false
      editor.getEditorState().read(() => {
        const galleryNode = $getNodeByKey(nodeKey)
        if (galleryNode && $isGalleryNode(galleryNode)) {
          const children = galleryNode.getChildren()
          flag = children.some((child: any) => {
            if ($isGalleryImageNode(child) && child.getId() === id) {
              return true
            } else {
              return false
            }
          })
        }
      })
      return flag
    },
    [editor, nodeKey],
  )

  const insertImageNodeFromUpload = useCallback(
    (upload: Media) => {
      editor.update(() => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const galleryNode = $getNodeByKey(nodeKey) as GalleryNode
        if (galleryNode && $isGalleryNode(galleryNode)) {
          if (!checkUploadNodeExists(upload.id)) {
            const node = $createGalleryImageNode({
              src: upload.url,
              altText: upload.alt,
              id: upload.id,
              width: upload.width,
              height: upload.height,
            })
            galleryNode.append(node)
          }
        }
      })
    },
    [checkUploadNodeExists, editor, nodeKey],
  )

  const removeUncheckedUploads = useCallback(() => {
    editor.update(() => {
      const galleryNode = $getNodeByKey(nodeKey)
      if (
        galleryNode &&
        $isGalleryNode(galleryNode) &&
        selection.length > 0 &&
        getUploadNodesCount() !== 0
      ) {
        const children = galleryNode.getChildren()
        if (children?.length > 0) {
          children.forEach((child: GalleryImageNode) => {
            if (child && $isGalleryImageNode(child) && child.getId() === null) {
              return
            }

            if (
              !selection.some(id => {
                if (child && $isGalleryImageNode(child) && id === child.getId()) {
                  return true
                } else {
                  return false
                }
              })
            ) {
              if ($isGalleryImageNode(child)) {
                child.remove()
              }
            }
          })
        }
      }
    })
  }, [editor, getUploadNodesCount, nodeKey, selection])

  //cases: selection is 0 => remove all uploads
  //selected uploads > existing ones => insert them into gallery
  //selected uploads < existing ones => remove unchecked and insert into gallery
  //if selected uploads count equals to existing => do nothing
  useEffect(() => {
    const insertMedia = async () => {
      if (shouldInsertMedia) {
        if (selection.length === 0) {
          editor.update(() => {
            const galleryNode = $getNodeByKey(nodeKey)
            if (galleryNode && $isGalleryNode(galleryNode)) {
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
              const children = galleryNode.getChildren() as GalleryImageNode[]
              if (children?.length > 0) {
                //local files(from device) don't have an id
                const uploads = children.filter(child => {
                  if (child && $isGalleryImageNode(child) && child.getId() !== null) {
                    return true
                  } else {
                    return false
                  }
                })

                uploads.forEach(upload => {
                  if ($isGalleryImageNode(upload)) {
                    upload.remove()
                  }
                })
              }
            }
          })
        } else if (selection.length > getUploadNodesCount()) {
          const uploadNodes: Media[] = []
          for (let i = 0; i < selection.length; i++) {
            if (!checkUploadNodeExists(selection[i])) {
              const media = await getMedia(selection[i])
              uploadNodes.push(media)
            }
          }
          uploadNodes.map(upload => insertImageNodeFromUpload(upload))
        } else if (selection.length < getUploadNodesCount()) {
          const media = await getMediaMultiple(selection)
          removeUncheckedUploads()
          media.map(upload => insertImageNodeFromUpload(upload))
        }
        setShouldInsertMedia(false)
      }
    }
    void insertMedia()
  }, [
    checkUploadNodeExists,
    editor,
    getMedia,
    getMediaMultiple,
    getUploadNodesCount,
    insertImageNodeFromUpload,
    nodeKey,
    removeUncheckedUploads,
    selection,
    setShouldInsertMedia,
    shouldInsertMedia,
  ])

  const checkFileNodeExists = useCallback(
    (file: FileWithResult) => {
      let flag = false
      editor.getEditorState().read(() => {
        const galleryNode = $getNodeByKey(nodeKey)
        if (galleryNode && $isGalleryNode(galleryNode)) {
          const children = galleryNode.getChildren()
          //local files do not have id set
          const fileNodes = children.filter((child: GalleryImageNode) => {
            if (child && $isGalleryImageNode(child) && child.getId() === null) {
              return true
            } else {
              return false
            }
          })
          flag = fileNodes.some((node: GalleryImageNode) => node.getSrc() === file.result)
        }
      })
      return flag
    },
    [editor, nodeKey],
  )

  const insertImageNodeFromFile = useCallback(
    (file: FileWithResult) => {
      editor.update(() => {
        const galleryNode = $getNodeByKey(nodeKey)
        if (galleryNode && $isGalleryNode(galleryNode)) {
          if (!checkFileNodeExists(file)) {
            const node = $createGalleryImageNode({
              src: file.result,
              altText: '',
              id: null,
            })
            galleryNode.append(node)
          }
        }
      })
    },
    [checkFileNodeExists, editor, nodeKey],
  )

  useEffect(() => {
    files.map(file => insertImageNodeFromFile(file))
  }, [files, insertImageNodeFromFile])

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      const droppedFiles = e.dataTransfer.files
      if (droppedFiles.length > 0) {
        const selectedFiles = Array.from(droppedFiles)
        const fileRes = await mediaFileReader(selectedFiles, ACCEPTABLE_IMAGE_TYPES)
        const filesToInsert: FileWithResult[] = [...files]
        for (const { file, result } of fileRes) {
          const fileExists = files.some(f => f.file.name === file.name)
          if (!fileExists && isMimeType(file, ACCEPTABLE_IMAGE_TYPES)) {
            filesToInsert.push({ file, result })
          } else {
            toast.error(`File ${file.name} already exists`)
          }
        }
        setFiles(filesToInsert)
        toggleModal(nodeKey)
      }
    },
    [files, nodeKey, setFiles, toggleModal],
  )

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault()

      const droppedFiles = e.clipboardData.files
      if (droppedFiles.length > 0) {
        const selectedFiles = Array.from(droppedFiles)
        const filesRes = await mediaFileReader(selectedFiles, ACCEPTABLE_IMAGE_TYPES)
        const filesToInsert: FileWithResult[] = [...files]
        for (const { file, result } of filesRes) {
          const fileExists = files.some(f => f.file.name === file.name)
          if (!fileExists && isMimeType(file, ACCEPTABLE_IMAGE_TYPES)) {
            filesToInsert.push({ file, result })
          } else {
            toast.error(`File ${file.name} already exists`)
          }
        }
        setFiles(filesToInsert)
        toggleModal(nodeKey)
      }
    },
    [files, nodeKey, setFiles, toggleModal],
  )

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files
      if (selectedFiles && selectedFiles.length > 0) {
        const arrFiles = Array.from(selectedFiles)
        const fileRes = await mediaFileReader(arrFiles, ACCEPTABLE_IMAGE_TYPES)
        const filesToInsert: FileWithResult[] = [...files]
        for (const { file, result } of fileRes) {
          const fileExists = files.some(f => f.file.name == file.name)
          if (!fileExists && isMimeType(file, ACCEPTABLE_IMAGE_TYPES)) {
            filesToInsert.push({ file, result })
          } else {
            toast.error(`File ${file.name} already exists`)
          }
        }
        setFiles(filesToInsert)
        toggleModal(nodeKey)
      }
    },
    [files, nodeKey, setFiles, toggleModal],
  )

  const toggleUploadsDrawer = useCallback(() => {
    editor.dispatchCommand(OPEN_UPLOAD_DRAWER_COMMAND, nodeKey)
  }, [editor, nodeKey])

  return (
    <SelectImageModal
      ref={dropZoneRef}
      handleDrop={handleDrop}
      handleFileChange={handleFileChange}
      handlePaste={handlePaste}
      toggleUploadsDrawer={toggleUploadsDrawer}
      galleryKey={nodeKey}
    />
  )
}

export default GalleryNodesHandler
