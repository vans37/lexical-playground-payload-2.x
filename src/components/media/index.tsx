'use client'
import Image from 'next/image'
import React from 'react'
import type { Media as MediaType } from '../../payload-types'
import classes from './index.module.scss'
import { removeForwardSlash, replaceOriginWithServerUrl } from '../../lib/utils'

export interface MediaProps {
  alt?: string
  fill?: boolean // for NextImage only
  height?: number // for NextImage only
  imgClassName?: string
  onClick?: () => void
  onLoad?: () => void
  priority?: boolean // for NextImage only
  resource?: MediaType // for Payload media
  size?: keyof MediaType['sizes']
  src?: string // for static media
  width?: number // for NextImage only
}

const breakpoints = {
  l: 1440,
  m: 1024,
  s: 768,
}

export const WrappedImage = ({ props }: { props: MediaProps }) => {
  const {
    alt: altFromProps,
    fill,
    height: heightFromProps,
    imgClassName,
    onClick,
    onLoad: onLoadFromProps,
    priority,
    resource,
    size,
    src: srcFromProps,
    width: widthFromProps,
  } = props

  const [isLoading, setIsLoading] = React.useState(true)
  const [isError, setError] = React.useState(false)

  let widthResult: number | undefined
  let heightResult: number | undefined
  let alt = altFromProps
  let src: string = srcFromProps || ''

  if (!src && resource) {
    const {
      alt: altFromResource,
      filename: fullFilename,
      height: fullHeight,
      sizes,
      width: fullWidth,
    } = resource

    if (!widthFromProps && !heightFromProps) {
      widthResult = fullWidth
      heightResult = fullHeight
    }

    widthResult = widthFromProps
    heightResult = heightFromProps
    alt = altFromResource

    let filename = fullFilename

    if (size) {
      filename = sizes[size].filename
    }

    src = `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/${filename}`
  } else if (src) {
    src = replaceOriginWithServerUrl(removeForwardSlash(src))
    widthResult = widthFromProps
    heightResult = heightFromProps
    alt = altFromProps
  }

  // NOTE: this is used by the browser to determine which image to download at different screen sizes
  const sizes = Object.entries(breakpoints)
    .map(([, value]) => `(max-width: ${value}px) ${value}px`)
    .join(', ')

  return (
    <Image
      alt={alt || ''}
      className={[isLoading && classes.placeholder, classes.image, imgClassName]
        .filter(Boolean)
        .join(' ')}
      fill={fill}
      onClick={onClick}
      onError={() => {
        setError(true)
      }}
      onLoad={() => {
        setIsLoading(false)
        if (typeof onLoadFromProps === 'function') {
          onLoadFromProps()
        }
      }}
      priority={priority}
      sizes={sizes}
      src={isError ? `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/not_found.png` : src}
      height={!fill ? heightResult : undefined}
      width={!fill ? widthResult : undefined}
    />
  )
}
