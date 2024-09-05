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
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  RangeSelection,
  SerializedElementNode,
} from 'lexical'

import { $createParagraphNode, $isElementNode, ElementNode } from 'lexical'

import { $isCollapsibleContainerNode } from './CollapsibleContainerNode'
import { $isCollapsibleContentNode } from './CollapsibleContentNode'

export type SerializedCollapsibleTitleNode = SerializedElementNode

export function $convertSummaryElement(domNode: HTMLElement): DOMConversionOutput | null {
  const node = $createCollapsibleTitleNode()
  return {
    node,
  }
}

export class CollapsibleTitleNode extends ElementNode {
  static clone(node: CollapsibleTitleNode): CollapsibleTitleNode {
    return new CollapsibleTitleNode(node.__key)
  }

  static getType(): string {
    return 'collapsible-title'
  }

  static importDOM(): DOMConversionMap | null {
    return {
      summary: (domNode: HTMLElement) => {
        return {
          conversion: $convertSummaryElement,
          priority: 1,
        }
      },
    }
  }

  static importJSON(serializedNode: SerializedCollapsibleTitleNode): CollapsibleTitleNode {
    return $createCollapsibleTitleNode()
  }

  collapseAtStart(_selection: RangeSelection): boolean {
    this.getParentOrThrow().insertBefore(this)
    return true
  }

  createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
    const dom = document.createElement('summary')
    dom.classList.add('Collapsible__title')
    return dom
  }

  exportJSON(): SerializedCollapsibleTitleNode {
    return {
      ...super.exportJSON(),
      type: 'collapsible-title',
      version: 1,
    }
  }

  insertNewAfter(_: RangeSelection, restoreSelection = true): ElementNode {
    const containerNode = this.getParentOrThrow()

    if (!$isCollapsibleContainerNode(containerNode)) {
      throw new Error('CollapsibleTitleNode expects to be child of CollapsibleContainerNode')
    }

    if (containerNode.getOpen()) {
      const contentNode = this.getNextSibling()
      if (!$isCollapsibleContentNode(contentNode)) {
        throw new Error('CollapsibleTitleNode expects to have CollapsibleContentNode sibling')
      }

      const firstChild = contentNode.getFirstChild()
      if ($isElementNode(firstChild)) {
        return firstChild
      } else {
        const paragraph = $createParagraphNode()
        contentNode.append(paragraph)
        return paragraph
      }
    } else {
      const paragraph = $createParagraphNode()
      containerNode.insertAfter(paragraph, restoreSelection)
      return paragraph
    }
  }

  updateDOM(prevNode: CollapsibleTitleNode, dom: HTMLElement): boolean {
    return false
  }
}

export function $createCollapsibleTitleNode(): CollapsibleTitleNode {
  return new CollapsibleTitleNode()
}

export function $isCollapsibleTitleNode(
  node: LexicalNode | null | undefined,
): node is CollapsibleTitleNode {
  return node instanceof CollapsibleTitleNode
}