import type { FieldHook } from 'payload/types'

import { type ClassValue, clsx } from 'clsx'
import slugify from 'slugify'
import { twMerge } from 'tailwind-merge'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const slugifyField: FieldHook = async ({ data, value }) => {
  const title = data?.title ?? value

  return slugify(title, {
    lower: true,
    replacement: '-',
    strict: true,
    trim: true,
  })
}

export const capitilizeFirstWord = (str: string) => {
  if (!str || str.length === 0) {
    return str
  }

  const firstChar = str.charAt(0)
  const capital = firstChar.toUpperCase()
  const remaining = str.slice(1)
  const titleTransformed = capital + remaining.toLowerCase()

  return titleTransformed
}

export const removeForwardSlash = (string: string) => {
  return string.replace(/([^:]\/)\/+/g, '$1')
}

export const replaceOriginWithServerUrl = (url: string) => {
  const newUrl = removeForwardSlash(url)

  if (url.startsWith('http')) {
    const origin = new URL(newUrl).origin
    return process.env.NEXT_PUBLIC_PAYLOAD_URL + newUrl.replace(origin, '')
  } else {
    if (!url.startsWith('/')) {
      url += '/'
    }
    return process.env.NEXT_PUBLIC_PAYLOAD_URL + url
  }
}

export const styleStringToObject = (styleString: string) => {
  return styleString.split(';').reduce((acc, style) => {
    // eslint-disable-next-line prefer-const
    let [property, value] = style.split(':')
    if (property && value) {
      property = property.trim().replace(/-([a-z])/g, (match, p1) => p1.toUpperCase())
      acc[property] = value.trim()
    }
    return acc
  }, {})
}
