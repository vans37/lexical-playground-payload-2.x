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
  SerializedElementNode,
} from 'lexical'

import { ElementNode } from 'lexical'

export type SerializedCollapsibleContentNode = SerializedElementNode

export function $convertCollapsibleContentElement(
  domNode: HTMLElement,
): DOMConversionOutput | null {
  const node = $createCollapsibleContentNode()
  return {
    node,
  }
}

export class CollapsibleContentNode extends ElementNode {
  static clone(node: CollapsibleContentNode): CollapsibleContentNode {
    return new CollapsibleContentNode(node.__key)
  }

  static getType(): string {
    return 'collapsible-content'
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-collapsible-content')) {
          return null
        }
        return {
          conversion: $convertCollapsibleContentElement,
          priority: 2,
        }
      },
    }
  }

  static importJSON(serializedNode: SerializedCollapsibleContentNode): CollapsibleContentNode {
    return $createCollapsibleContentNode()
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = document.createElement('div')
    dom.classList.add('Collapsible__content')
    return dom
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('div')
    element.classList.add('Collapsible__content')
    element.setAttribute('data-lexical-collapsible-content', 'true')
    return { element }
  }

  exportJSON(): SerializedCollapsibleContentNode {
    return {
      ...super.exportJSON(),
      type: 'collapsible-content',
      version: 1,
    }
  }

  isShadowRoot(): boolean {
    return true
  }

  updateDOM(prevNode: CollapsibleContentNode, dom: HTMLElement): boolean {
    return false
  }
}

export function $createCollapsibleContentNode(): CollapsibleContentNode {
  return new CollapsibleContentNode()
}

export function $isCollapsibleContentNode(
  node: LexicalNode | null | undefined,
): node is CollapsibleContentNode {
  return node instanceof CollapsibleContentNode
}
