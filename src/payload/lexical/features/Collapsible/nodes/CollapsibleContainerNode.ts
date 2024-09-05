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
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
  Spread,
} from 'lexical'

import { ElementNode } from 'lexical'

export type SerializedCollapsibleContainerNode = Spread<
  {
    open: boolean
  },
  SerializedElementNode
>

export function $convertDetailsElement(domNode: HTMLDetailsElement): DOMConversionOutput | null {
  const isOpen = domNode.open !== undefined ? domNode.open : true
  const node = $createCollapsibleContainerNode(isOpen)
  return {
    node,
  }
}

export class CollapsibleContainerNode extends ElementNode {
  __open: boolean

  constructor(open: boolean, key?: NodeKey) {
    super(key)
    this.__open = open
  }

  static clone(node: CollapsibleContainerNode): CollapsibleContainerNode {
    return new CollapsibleContainerNode(node.__open, node.__key)
  }

  static getType(): string {
    return 'collapsible-container'
  }

  static importDOM(): DOMConversionMap<HTMLDetailsElement> | null {
    return {
      details: (domNode: HTMLDetailsElement) => {
        return {
          conversion: $convertDetailsElement,
          priority: 1,
        }
      },
    }
  }

  static importJSON(serializedNode: SerializedCollapsibleContainerNode): CollapsibleContainerNode {
    const node = $createCollapsibleContainerNode(serializedNode.open)
    return node
  }

  createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
    const dom = document.createElement('details')
    dom.classList.add('Collapsible__container')
    dom.open = this.__open
    dom.addEventListener('toggle', () => {
      const open = editor.getEditorState().read(() => this.getOpen())
      if (open !== dom.open) {
        editor.update(() => this.toggleOpen())
      }
    })
    return dom
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('details')
    element.classList.add('Collapsible__container')
    element.setAttribute('open', this.__open.toString())
    return { element }
  }

  exportJSON(): SerializedCollapsibleContainerNode {
    return {
      ...super.exportJSON(),
      type: 'collapsible-container',
      open: this.__open,
      version: 1,
    }
  }

  getOpen(): boolean {
    return this.getLatest().__open
  }

  setOpen(open: boolean): void {
    const writable = this.getWritable()
    writable.__open = open
  }

  toggleOpen(): void {
    this.setOpen(!this.getOpen())
  }

  updateDOM(prevNode: CollapsibleContainerNode, dom: HTMLDetailsElement): boolean {
    if (prevNode.__open !== this.__open) {
      dom.open = this.__open
    }

    return false
  }
}

export function $createCollapsibleContainerNode(isOpen: boolean): CollapsibleContainerNode {
  return new CollapsibleContainerNode(isOpen)
}

export function $isCollapsibleContainerNode(
  node: LexicalNode | null | undefined,
): node is CollapsibleContainerNode {
  return node instanceof CollapsibleContainerNode
}
