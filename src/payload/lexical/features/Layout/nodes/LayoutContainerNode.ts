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
  SerializedElementNode,
  Spread,
} from 'lexical'

import { addClassNamesToElement } from '@lexical/utils'
import { ElementNode } from 'lexical'

export type SerializedLayoutContainerNode = Spread<
  {
    templateColumns: string
  },
  SerializedElementNode
>

function $convertLayoutContainerElement(domNode: HTMLElement): DOMConversionOutput | null {
  const styleAttributes = window.getComputedStyle(domNode)
  const templateColumns = styleAttributes.getPropertyValue('grid-template-columns')
  if (templateColumns) {
    const node = $createLayoutContainerNode(templateColumns)
    return { node }
  }
  return null
}

export class LayoutContainerNode extends ElementNode {
  __templateColumns: string

  constructor(templateColumns: string, key?: NodeKey) {
    super(key)
    this.__templateColumns = templateColumns
  }

  static clone(node: LayoutContainerNode): LayoutContainerNode {
    return new LayoutContainerNode(node.__templateColumns, node.__key)
  }

  static getType(): string {
    return 'layout-container'
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-layout-container')) {
          return null
        }
        return {
          conversion: $convertLayoutContainerElement,
          priority: 2,
        }
      },
    }
  }

  static importJSON(json: SerializedLayoutContainerNode): LayoutContainerNode {
    return $createLayoutContainerNode(json.templateColumns)
  }

  canBeEmpty(): boolean {
    return false
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement('div')
    dom.style.gridTemplateColumns = this.__templateColumns
    if (typeof config.theme.layoutContainer === 'string') {
      addClassNamesToElement(dom, config.theme.layoutContainer)
    }
    return dom
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div')
    element.style.gridTemplateColumns = this.__templateColumns
    element.setAttribute('data-lexical-layout-container', 'true')
    return { element }
  }

  exportJSON(): SerializedLayoutContainerNode {
    return {
      ...super.exportJSON(),
      type: 'layout-container',
      templateColumns: this.__templateColumns,
      version: 1,
    }
  }

  getTemplateColumns(): string {
    return this.getLatest().__templateColumns
  }

  isShadowRoot(): boolean {
    return true
  }

  setTemplateColumns(templateColumns: string) {
    this.getWritable().__templateColumns = templateColumns
  }

  updateDOM(prevNode: LayoutContainerNode, dom: HTMLElement): boolean {
    if (prevNode.__templateColumns !== this.__templateColumns) {
      dom.style.gridTemplateColumns = this.__templateColumns
    }
    return false
  }
}

export function $createLayoutContainerNode(templateColumns: string): LayoutContainerNode {
  return new LayoutContainerNode(templateColumns)
}

export function $isLayoutContainerNode(
  node: LexicalNode | null | undefined,
): node is LayoutContainerNode {
  return node instanceof LayoutContainerNode
}
