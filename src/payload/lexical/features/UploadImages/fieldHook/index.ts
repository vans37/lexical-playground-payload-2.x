import type LexicalEditor from 'lexical'
import type { Payload } from 'payload'
import type { FieldHookArgs } from 'payload/types'

import { randomUUID } from 'crypto'

import type { SerializedGalleryImageNode } from '../../ImageGallery/nodes/GalleryImageNode'
import type { SerializedImageNode } from '../../Images/nodes/ImageNode'


import {
  imageMimeTypes,
  slugifyString,
  uploadImageWithDataUrl,
  uploadImageWithFile,
} from '../utils'
import { Media } from '../../../../../payload-types'
import { setProperty } from '../../../../utilities/dotProp'

export class ServerLexicalState {
  state: LexicalEditor.SerializedEditorState[] = []

  async deleteDiffImages(
    payload: Payload,
    diffs: Array<SerializedGalleryImageNode | SerializedImageNode>,
  ) {
    if (diffs.length > 0) {
      try {
        const promises = []
        diffs.forEach(image => {
          promises.push(
            payload.delete({
              id: image.id,
              collection: 'media',
            }),
          )
        })
        await Promise.all(promises)
      } catch (err) {
        payload.logger.error(err)
      }
    }
  }

  diff() {
    const [prevState, currState] = this.state

    if (!prevState || !currState) {
      return []
    }

    let prevStateImages: Array<SerializedImageNode> = []
    let currentStateImages: Array<SerializedImageNode> = []

    prevStateImages = this.extractImageNodes(prevState)
    currentStateImages = this.extractImageNodes(currState)

    const deletedImages = prevStateImages.filter(
      prevImage => !currentStateImages.some(currImage => currImage.id === prevImage.id),
    )

    return deletedImages
  }

  extractImageNodes(obj) {
    const images = []

    const traverse = node => {
      if (node.type === 'image' && node.isWebUploadable) {
        images.push(node)
      } else if (node.type === 'gallery-image') {
        //don't delete upload if gallery image is removed
        return
      }

      if (node.children && node.children.length > 0) {
        node.children.forEach(child => traverse(child))
      }
    }

    traverse(obj.root)

    return images
  }

  setState(state: LexicalEditor.SerializedEditorState) {
    this.state.push(state)
  }
}

const findAndUploadImages = async (currentValue, node, path = 'root', payload: Payload) => {
  if (node.children && node.children.length > 0) {
    for (let i = 0; i < node.children.length; i++) {
      const childPath = `${path}.children[${i}]`
      await findAndUploadImages(currentValue, node.children[i], childPath, payload)
    }
  }

  if (node.type === 'image' || node.type === 'gallery-image') {
    const currNode = node as SerializedGalleryImageNode | SerializedImageNode
    const src = currNode.src
    const id = currNode.id

    //image is marked as non uploadable, preserve src from web
    if (node.type !== 'gallery-image' && !node?.isWebUploadable) {
      return
    }

    if (id) {
      try {
        const existingMedia = await payload.findByID({
          id,
          collection: 'media',
        })
        if (existingMedia.id === id) {
          return
        }
      } catch (err) {
        payload.logger.error(err)
      }
    }

    //data:image - pasted from clipboard or dragged and dropped
    if (src.startsWith('data:image')) {
      try {
        const uploadedMedia = (await uploadImageWithDataUrl(
          payload,
          //in payload 2.18.x+ create media document will fail if focal focal point is not specified.
          {
            focalX: 50,
            focalY: 50,
          },
          {
            altText: node.altText,
            data: src,
          },
        )) as unknown as Media
        node.src = uploadedMedia.url
        node.id = uploadedMedia.id
        node.width = uploadedMedia.width
        node.height = uploadedMedia.height
        setProperty(currentValue, path, node)
      } catch (err) {
        payload.logger.error(err)
      }
    } else if (src.startsWith('http')) {
      try {
        const response = await fetch(src)
        const imageBlob = await response.blob()
        const mimeType = imageBlob.type
        const dataArray = await imageBlob.arrayBuffer()
        const buff = Buffer.from(dataArray)
        const size = buff.length
        const alt = node.altText
        const fileExtension = imageMimeTypes[mimeType]
        const filename = alt ? slugifyString(alt) : randomUUID()

        const file = {
          name: filename + fileExtension,
          data: buff,
          mimetype: mimeType,
          size,
        }

        const uploadedMedia = await uploadImageWithFile(payload, file)
        node.src = uploadedMedia.url
        node.id = uploadedMedia.id
        node.width = uploadedMedia.width
        node.height = uploadedMedia.height
        setProperty(currentValue, path, node)
      } catch (err) {
        payload.logger.error(err)
      }
    } else {
      return
    }
  }
}

export const uploadImagesHook = async (args: FieldHookArgs) => {
  const { previousValue, req, value } = args
  const payload = req.payload

  if (value?.root) {
    /* 
     Previous value is empty lexical state:
     for newly created document field value is null,
     when editor state is cleared via clearState command or clear action button,
     field value will be lexical state object with root and at least one child with type - paragraph.
     Setting field value as null after clearing state will cause editor to throw an error and
     corrupt rich text field.
  */

    const isInitialUpload =
      !previousValue ||
      (previousValue?.root?.children?.length === 1 &&
        previousValue?.root?.children[0]?.type === 'paragraph' &&
        previousValue?.root?.children[0]?.children?.length === 0)

    if (isInitialUpload) {
      await findAndUploadImages(value, value.root, 'root', payload)
      return value
    }

    const lexicalServerState = new ServerLexicalState()

    lexicalServerState.setState(previousValue)
    lexicalServerState.setState(value)

    const diffNodes = lexicalServerState.diff()

    await lexicalServerState.deleteDiffImages(payload, diffNodes)

    await findAndUploadImages(value, value.root, 'root', payload)

    return value
  }

  return null
}
