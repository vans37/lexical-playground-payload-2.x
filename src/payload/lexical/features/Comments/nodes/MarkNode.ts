/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  BaseSelection,
  EditorConfig,
  LexicalNode,
  NodeKey,
  RangeSelection,
  SerializedElementNode,
  Spread,
} from 'lexical'

import { addClassNamesToElement, removeClassNamesFromElement } from '@lexical/utils'
import { $applyNodeReplacement, $isRangeSelection, ElementNode } from 'lexical'

export type SerializedMarkNode = Spread<
  {
    ids: Array<string>
  },
  SerializedElementNode
>

/** @noInheritDoc */
export class MarkNode extends ElementNode {
  /** @internal */
  __ids: Array<string>

  constructor(ids: Array<string>, key?: NodeKey) {
    super(key)
    this.__ids = ids || []
  }

  static clone(node: MarkNode): MarkNode {
    return new MarkNode(Array.from(node.__ids), node.__key)
  }

  static getType(): string {
    return 'mark'
  }

  static importDOM(): null {
    return null
  }

  static importJSON(serializedNode: SerializedMarkNode): MarkNode {
    const node = $createMarkNode(serializedNode.ids)
    node.setFormat(serializedNode.format)
    node.setIndent(serializedNode.indent)
    node.setDirection(serializedNode.direction)
    return node
  }

  addID(id: string): void {
    const self = this.getWritable()
    if ($isMarkNode(self)) {
      const ids = self.__ids
      self.__ids = ids
      for (let i = 0; i < ids.length; i++) {
        // If we already have it, don't add again
        if (id === ids[i]) {
          return
        }
      }
      ids.push(id)
    }
  }

  canBeEmpty(): false {
    return false
  }

  canInsertTextAfter(): false {
    return false
  }

  canInsertTextBefore(): false {
    return false
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = document.createElement('mark')
    addClassNamesToElement(element, config.theme.mark)
    if (this.__ids.length > 1) {
      addClassNamesToElement(element, config.theme.markOverlap)
    }
    return element
  }

  deleteID(id: string): void {
    const self = this.getWritable()
    if ($isMarkNode(self)) {
      const ids = self.__ids
      self.__ids = ids
      for (let i = 0; i < ids.length; i++) {
        if (id === ids[i]) {
          ids.splice(i, 1)
          return
        }
      }
    }
  }

  excludeFromCopy(destination: 'clone' | 'html'): boolean {
    return destination !== 'clone'
  }

  exportJSON(): SerializedMarkNode {
    return {
      ...super.exportJSON(),
      type: 'mark',
      ids: this.getIDs(),
      version: 1,
    }
  }

  extractWithChild(
    child: LexicalNode,
    selection: BaseSelection,
    destination: 'clone' | 'html',
  ): boolean {
    if (!$isRangeSelection(selection) || destination === 'html') {
      return false
    }
    const anchor = selection.anchor
    const focus = selection.focus
    const anchorNode = anchor.getNode()
    const focusNode = focus.getNode()
    const isBackward = selection.isBackward()
    const selectionLength = isBackward ? anchor.offset - focus.offset : focus.offset - anchor.offset
    return (
      this.isParentOf(anchorNode) &&
      this.isParentOf(focusNode) &&
      this.getTextContent().length === selectionLength
    )
  }

  getIDs(): Array<string> {
    const self = this.getLatest()
    return $isMarkNode(self) ? self.__ids : []
  }

  hasID(id: string): boolean {
    const ids = this.getIDs()
    for (let i = 0; i < ids.length; i++) {
      if (id === ids[i]) {
        return true
      }
    }
    return false
  }

  insertNewAfter(selection: RangeSelection, restoreSelection = true): ElementNode | null {
    const markNode = $createMarkNode(this.__ids)
    this.insertAfter(markNode, restoreSelection)
    return markNode
  }

  isInline(): true {
    return true
  }

  updateDOM(prevNode: MarkNode, element: HTMLElement, config: EditorConfig): boolean {
    const prevIDs = prevNode.__ids
    const nextIDs = this.__ids
    const prevIDsCount = prevIDs.length
    const nextIDsCount = nextIDs.length
    const overlapTheme = config.theme.markOverlap

    if (prevIDsCount !== nextIDsCount) {
      if (prevIDsCount === 1) {
        if (nextIDsCount === 2) {
          addClassNamesToElement(element, overlapTheme)
        }
      } else if (nextIDsCount === 1) {
        removeClassNamesFromElement(element, overlapTheme)
      }
    }
    return false
  }
}

export function $createMarkNode(ids: Array<string>): MarkNode {
  return $applyNodeReplacement(new MarkNode(ids))
}

export function $isMarkNode(node: LexicalNode | null): node is MarkNode {
  return node instanceof MarkNode
}
