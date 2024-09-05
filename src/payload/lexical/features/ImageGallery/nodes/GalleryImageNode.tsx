/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical'

import './ImageNode.css'
import { DecoratorNode } from 'lexical'
import * as React from 'react'
import GalleryImageComponent from './GalleryImageComponent'

export interface ImagePayload {
  altText: string
  caption?: string
  height?: number
  key?: NodeKey
  maxWidth?: number
  showCaption?: boolean
  src: string
  width?: number
  id?: number // this is the id of uploaded image to media collection
}

export type SerializedGalleryImageNode = Spread<
  {
    altText: string
    caption: string
    height?: number
    maxWidth: number
    showCaption: boolean
    src: string
    width?: number
    type: 'gallery-image'
    version: 1
    id?: number
  },
  SerializedLexicalNode
>

//Mostly default ImageNode from lexical playground with
//some basic modification to support uploading into
//media collection in payload

export class GalleryImageNode extends DecoratorNode<JSX.Element> {
  __src: string
  __altText: string
  __width: 'inherit' | number
  __height: 'inherit' | number
  __maxWidth: number
  __showCaption: boolean
  __caption: string
  __id: number

  static getType(): string {
    return 'gallery-image'
  }

  static clone(node: GalleryImageNode): GalleryImageNode {
    return new GalleryImageNode(
      node.__src,
      node.__altText,
      node.__maxWidth,
      node.__width,
      node.__height,
      node.__showCaption,
      node.__caption,
      node.__key,
      node.__id,
    )
  }

  static importJSON(serializedNode: SerializedGalleryImageNode): GalleryImageNode {
    const { altText, height, width, maxWidth, caption, src, showCaption, id } = serializedNode
    const node = $createGalleryImageNode({
      altText,
      height,
      maxWidth,
      showCaption,
      src,
      width,
      caption,
      id,
    })

    return node
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('figure')
    const figCaption = document.createElement('figcaption')
    figCaption.textContent = this.__caption
    const image = document.createElement('img')
    image.setAttribute('src', this.__src)
    image.setAttribute('alt', this.__altText)
    element.appendChild(figCaption)
    element.appendChild(image)

    return { element }
  }

  //don't use import dom or
  //inserting images from buffer
  //will rewrite and use ImageGalleryNode instead of
  //regular ImageNode

  constructor(
    src: string,
    altText: string,
    maxWidth: number,
    width?: 'inherit' | number,
    height?: 'inherit' | number,
    showCaption?: boolean,
    caption?: string,
    key?: NodeKey,
    id?: number,
  ) {
    super(key)
    this.__src = src
    this.__altText = altText
    this.__maxWidth = maxWidth
    this.__width = width || 'inherit'
    this.__height = height || 'inherit'
    this.__showCaption = showCaption || false
    this.__caption = caption
    this.__id = id
  }

  exportJSON(): SerializedGalleryImageNode {
    return {
      altText: this.getAltText(),
      caption: this.__caption,
      height: this.__height === 'inherit' ? 0 : this.__height,
      maxWidth: this.__maxWidth,
      showCaption: this.__showCaption,
      src: this.getSrc(),
      type: 'gallery-image',
      version: 1,
      width: this.__width === 'inherit' ? 0 : this.__width,
      id: this.getId(),
    }
  }

  setWidthAndHeight(width: 'inherit' | number, height: 'inherit' | number): void {
    const writable = this.getWritable()
    writable.__width = width
    writable.__height = height
  }

  setShowCaption(showCaption: boolean): void {
    const writable = this.getWritable()
    writable.__showCaption = showCaption
  }

  setCaption(caption: string): void {
    const writable = this.getWritable()
    writable.__caption = caption
  }

  getCaption(): string {
    const self = this.getLatest()
    return self.__caption
  }

  getSrc(): string {
    const self = this.getLatest()
    return self.__src
  }

  getId(): number {
    const self = this.getLatest()
    return self.__id
  }

  getAltText(): string {
    return this.__altText
  }

  // View

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span')
    span.setAttribute('node-key', this.getKey())
    const theme = config.theme
    const className = theme.image
    if (className !== undefined) {
      span.className = className
    }
    return span
  }

  updateDOM(): false {
    return false
  }

  decorate(): JSX.Element {
    return (
      <GalleryImageComponent
        src={this.__src}
        altText={this.__altText}
        width={this.__width}
        height={this.__height}
        maxWidth={this.__maxWidth}
        nodeKey={this.getKey()}
        showCaption={this.__showCaption}
        caption={this.__caption}
        id={this.__id}
      />
    )
  }
}

export function $createGalleryImageNode({
  altText,
  height,
  maxWidth = 500,
  src,
  width,
  showCaption,
  caption,
  key,
  id,
}: ImagePayload): GalleryImageNode {
  return new GalleryImageNode(src, altText, maxWidth, width, height, showCaption, caption, key, id)
}

export function $isGalleryImageNode(
  node: LexicalNode | null | undefined,
): node is GalleryImageNode {
  return node instanceof GalleryImageNode
}
