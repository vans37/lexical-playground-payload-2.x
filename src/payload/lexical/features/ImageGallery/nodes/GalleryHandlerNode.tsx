/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { DOMExportOutput, LexicalNode, NodeKey, SerializedLexicalNode, Spread } from 'lexical'

import { DecoratorNode } from 'lexical'
import * as React from 'react'
import GalleryHandlerComponent from './GalleryHandlerComponent'

export type SerializedGalleryHandlerNode = Spread<
  {
    type: 'gallery-handler'
    version: 1
  },
  SerializedLexicalNode
>
//this node is responsible for controlling gallery, i.e inserting, deliting media and other stuff
export class GalleryHandlerNode extends DecoratorNode<JSX.Element> {
  static getType(): string {
    return 'gallery-handler'
  }

  static clone(node: GalleryHandlerNode): GalleryHandlerNode {
    return new GalleryHandlerNode()
  }

  static importJSON(serializedNode: SerializedLexicalNode): GalleryHandlerNode {
    const node = $createGalleryHandlerNode()

    return node
  }

  exportDOM(): DOMExportOutput {
    return null
  }

  exportJSON(): SerializedGalleryHandlerNode {
    return {
      type: 'gallery-handler',
      version: 1,
    }
  }

  constructor(key?: NodeKey) {
    super(key)
  }

  // View
  createDOM(): HTMLElement {
    const div = document.createElement('div')
    div.className = 'gallery-controls'

    return div
  }

  updateDOM(): false {
    return false
  }

  decorate(): JSX.Element {
    return <GalleryHandlerComponent nodeKey={this.getKey()} />
  }
}

export function $createGalleryHandlerNode(): GalleryHandlerNode {
  return new GalleryHandlerNode()
}

export function $isGalleryHandlerNode(
  node: LexicalNode | null | undefined,
): node is GalleryHandlerNode {
  return node instanceof GalleryHandlerNode
}
