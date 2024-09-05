import * as React from 'react'
import type { LexicalNode, NodeKey, Spread, SerializedElementNode, DOMExportOutput } from 'lexical'
import { $applyNodeReplacement, ElementNode } from 'lexical'

/* 
  GalleryNode is an instance of ElementNode, because only element nodes 
  can be a parent of other nodes, i.e have child nodes that are registered or 'known' to the editor state.

  At first I used DecoratorNode and manually added methods to handle children: append, remove, etc.
  I decided to reuse ImageNode from lexical playground due to its almost ready to use functionality
  out of the box.
  
  The problem with my approach was that all the child nodes that I had created and appended to the DecoratorNode
  were not registered in the editor and thus all images became non interactive: focus, deletion, insertion etc.
  
  There's a PR to let DecoratorNode have child nodes. 
  Read: https://github.com/facebook/lexical/issues/5930
*/

//I use this gallery on the frontend, https://react-photo-album.com/
//it is optionated, and you can modify or delete this
export const GALLERY_LAYOUTS = ['rows', 'columns', 'masonry'] as const

export type GalleryLayouts = (typeof GALLERY_LAYOUTS)[number]

export type SerializedGalleryNode = Spread<
  {
    galleryLayout: GalleryLayouts
    columns: number
  },
  SerializedElementNode
>

export class GalleryNode extends ElementNode {
  __galleryLayout: GalleryLayouts
  __columns: number = 3
  __isSelected: boolean

  static getType(): string {
    return 'gallery'
  }

  static clone(node: GalleryNode): GalleryNode {
    return new GalleryNode(node.__galleryLayout, node.__columns)
  }

  constructor(galleryLayout: GalleryLayouts, columns: number, key?: NodeKey) {
    super(key)
    this.__galleryLayout = galleryLayout
    this.__columns = columns
    this.__isSelected = false
  }

  static importJSON(serializedNode: SerializedGalleryNode): GalleryNode {
    const node = $createGalleryNode(serializedNode.galleryLayout, serializedNode.columns)
    return node
  }

  exportJSON(): SerializedGalleryNode {
    return {
      ...super.exportJSON(),
      galleryLayout: this.__galleryLayout,
      columns: this.__columns,
      type: 'gallery',
      version: 1,
    }
  }

  createDOM(): HTMLElement {
    const gallery = document.createElement('div')
    gallery.className = `gallery-node ${this.__isSelected ? 'selected' : ''}`
    //restrict editing this node so that user wouldn't be able to insert
    //text and other nodes into the gallery
    gallery.contentEditable = 'false'
    gallery.setAttribute('data-node-key', this.getKey())

    return gallery
  }

  exportDOM(): DOMExportOutput {
    return null
  }

  updateDOM(prevNode: GalleryNode, dom: HTMLElement): boolean {
    const element = dom
    if (prevNode.__isSelected !== this.__isSelected) {
      if (this.__isSelected) {
        element.classList.add('selected')
      } else {
        element.classList.remove('selected')
      }
    }
    return false
  }

  canBeEmpty(): boolean {
    return true
  }

  /* 
    The functionality of selection of element nodes come out of the box in lexical editor.
    For decorator node we can use special react hooks to check if node is selected.
    But due to non conventional usage of element node we must implement
    selection ourself. It is bugged for now.
  */
  setIsSelected(value: boolean): void {
    const writable = this.getWritable()
    writable.__isSelected = value
  }

  getIsSelected(): boolean {
    const self = this.getLatest()
    return self.__isSelected
  }

  setGalleryLayout(value: GalleryLayouts): void {
    const writable = this.getWritable()
    writable.__galleryLayout = value
  }

  getGalleryLayout(): GalleryLayouts {
    const self = this.getLatest()
    return self.__galleryLayout
  }

  setColumns(value: number): void {
    const writable = this.getWritable()
    writable.__columns = value
  }

  getColumns(): number {
    const self = this.getLatest()
    return self.__columns
  }
}

export function $createGalleryNode(layout: GalleryLayouts, columns: number): GalleryNode {
  const galleryNode = new GalleryNode(layout, columns)
  return $applyNodeReplacement(galleryNode)
}

export function $isGalleryNode(node: LexicalNode | null | undefined): node is GalleryNode {
  return node instanceof GalleryNode
}
