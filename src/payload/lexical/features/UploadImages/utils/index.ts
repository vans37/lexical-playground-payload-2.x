'server only'
import type { GeneratedTypes, Payload } from 'payload'
import type { File } from 'payload/dist/uploads/types'

import { randomUUID } from 'crypto'
import path from 'path'
import slugify from 'slugify'
import { Media } from '../../../../../payload-types'

export const imageMimeTypes = {
  'image/apng': '.apng',
  'image/avif': '.avif',
  'image/gif': '.gif',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/svg+xml': '.svg',
  'image/webp': '.webp',
}

const extractMetaData = base64String => {
  const mimeType = base64String.match(/^data:(image\/\w+);base64,/)[1]
  const base64Data = base64String.replace(/^data:image\/\w+;base64,/, '')
  const binaryString = atob(base64Data)
  const bytes = new Uint8Array(binaryString.length)

  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }

  const buffer = Buffer.from(bytes)
  const size = buffer.length

  return { buffer, mimeType, size }
}

export const uploadImageWithFilePath = async <T extends keyof GeneratedTypes['collections']>(
  payload: Payload,
  pathToMedia: string,
  data?: Pick<Media, 'createdAt' | 'id' | 'sizes' | 'updatedAt'>,
  collection?: T,
) => {
  const defaultCollection: keyof GeneratedTypes['collections'] = 'media'

  return await payload.create({
    collection: collection ?? defaultCollection,
    filePath: path.resolve(pathToMedia),
    //@ts-expect-error
    data,
  })
}

export const uploadImageWithDataUrl = async <T extends keyof GeneratedTypes['collections']>(
  payload: Payload,
  data?: Partial<Pick<Media, 'createdAt' | 'focalX' | 'focalY' | 'id' | 'sizes' | 'updatedAt'>>,
  dataUrl?: {
    altText?: string
    data: string
  },
  collection?: T,
) => {
  const filePath = dataUrl.altText ? slugifyString(dataUrl.altText) : randomUUID()
  const { buffer, mimeType, size } = extractMetaData(dataUrl.data)
  const fileExtension = imageMimeTypes[mimeType]

  if (!fileExtension) {
    throw new Error('Unsupported mime type: ', mimeType)
  }

  const defaultCollection: keyof GeneratedTypes['collections'] = 'media'
  const fileName = dataUrl.altText ? slugifyString(dataUrl.altText) : filePath + fileExtension
  const file: File = {
    name: fileName,
    data: buffer,
    mimetype: mimeType,
    size,
  }

  try {
    return await payload.create({
      collection: collection ?? defaultCollection,
      //@ts-expect-error
      data,
      file,
    })
  } catch (err) {
    payload.logger.error(err)
  }
}

export const uploadImageWithFile = async <T extends keyof GeneratedTypes['collections'] = 'media'>(
  payload: Payload,
  file: File,
  collection?: T,
) => {
  const defaultCollection: keyof GeneratedTypes['collections'] = 'media'

  return await payload.create({
    collection: collection ?? defaultCollection,
    file,
    //@ts-expect-error
    data: {},
  })
}

//https://stackoverflow.com/a/20285053
export const toDataURL = (url: string) =>
  fetch(url)
    .then(response => response.blob())
    .then(
      blob =>
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        }),
    )

export const slugifyString = (string: string) => {
  return slugify(string, {
    lower: true,
    replacement: '-',
    strict: true,
    trim: true,
  })
}
