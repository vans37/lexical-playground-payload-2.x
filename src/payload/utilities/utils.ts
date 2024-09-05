import type { GeneratedTypes, Payload } from 'payload'
import type { File } from 'payload/dist/uploads/types'

import { randomUUID } from 'crypto'
import fs from 'fs'
import path from 'path'
import slugify from 'slugify'

import type { Media } from '../../payload-types'

import { slugifyString } from '../lexical/features/UploadImages/utils'

// https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types#image_types
const imageMimeTypes = {
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

export const uploadMediaByFilePath = async <T extends keyof GeneratedTypes['collections']>(
  payload: Payload,
  pathToMedia: string,
  //unexpected crash on payload version 2.18.x + if focal point is not specified
  data?: Partial<Pick<Media, 'createdAt' | 'focalX' | 'focalY' | 'id' | 'sizes' | 'updatedAt'>>,
  collection?: T,
) => {
  const defaultCollection: keyof GeneratedTypes['collections'] = 'media'

  try {
    return await payload.create({
      collection: collection ?? defaultCollection,
      filePath: path.resolve(pathToMedia),
      //@ts-expect-error
      data,
    })
  } catch (err) {
    throw new Error(err)
  }
}

export const uploadMediaByDataUrl = async <T extends keyof GeneratedTypes['collections'] = 'media'>(
  payload: Payload,
    //unexpected crash on payload version 2.18.x + if focal point is not specified
  data?: Partial<Pick<Media, 'createdAt' | 'focalX' | 'focalY' | 'id' | 'sizes' | 'updatedAt'>>,
  dataUrl?: {
    altText?: string
    data: string
  },
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
      collection: defaultCollection,
      data,
      file,
    })
  } catch (err) {
    throw new Error(err)
  }
}

export const uploadMediaByFile = async <T extends keyof GeneratedTypes['collections'] = 'media'>(
  payload: Payload,
  file: File,
  collection?: T,
) => {
  const defaultCollection: keyof GeneratedTypes['collections'] = 'media'

  try {
    return await payload.create({
      collection: collection ?? defaultCollection,
      file,
      //@ts-expect-error
      data: {},
    })
  } catch (err) {
    throw new Error(err)
  }
}

export const uploadMediaMultiple = async (
    //unexpected crash on payload version 2.18.x + if focal point is not specified
  files: { data?: Partial<Pick<Media, 'createdAt' | 'focalX' | 'focalY' | 'id' | 'sizes' | 'updatedAt'>>; filePath: string }[],
  payload: Payload,
) => {
  try {
    return await Promise.all(
      files.map(async file => {
        return await uploadMediaByFilePath(payload, file.filePath, file.data)
      }),
    )
  } catch (err) {
    throw new Error(err)
  }
}

export const createSlug = (title: string) => {
  return slugify(title, {
    lower: true,
    replacement: '-',
    strict: true,
    trim: true,
  })
}

export const clearPublicFolder = (pathToDir: string) => {
  const dir = path.resolve(__dirname, pathToDir)
  if (fs.existsSync(dir)) {
    fs.rmdirSync(dir, { recursive: true })
  }
}

export const removeForwardSlash = (string: string) => {
  return string.replace(/([^:]\/)\/+/g, '$1')
}

export const replaceOriginWithServerUrl = (url: string) => {
  const newUrl = removeForwardSlash(url)

  if (url.startsWith('http')) {
    const origin = new URL(newUrl).origin
    return process.env.PAYLOAD_PUBLIC_SERVER_URL + newUrl.replace(origin, '')
  } else {
    return url
  }
}
