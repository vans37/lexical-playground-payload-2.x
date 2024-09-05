import type { HTMLConverter } from '@payloadcms/richtext-lexical'
import type { SerializedTextNode } from 'lexical'

//https://github.com/Livog/Payload.3.0.Starter/blob/main/src/components/LexicalContent/index.tsx
const IS_BOLD = 1
const IS_ITALIC = 2
const IS_STRIKETHROUGH = 4
const IS_UNDERLINE = 8
const IS_CODE = 16
const IS_SUBSCRIPT = 32
const IS_SUPERSCRIPT = 64

export const TextHTMLConverter: HTMLConverter<SerializedTextNode> = {
  converter({ node }) {
    const text = node.text
    const styleString = node.style
    const formatFunctions = {
      [IS_BOLD]: child => `<strong style="${styleString}">${child}</strong>`,
      [IS_CODE]: child => `<code style="${styleString}">${child}</code>`,
      [IS_ITALIC]: child => `<em style="${styleString}">${child}</em>`,
      [IS_STRIKETHROUGH]: child => `<del style="${styleString}">${child}</del>`,
      [IS_SUBSCRIPT]: child => `<sub style="${styleString}">${child}</sub>`,
      [IS_SUPERSCRIPT]: child => `<sup style="${styleString}">${child}</sup>`,
      [IS_UNDERLINE]: child => `<u style="${styleString}">${child}</u>`,
    }

    let formattedText = `<span style="${styleString}">${text}</span>`

    for (const [key, formatter] of Object.entries(formatFunctions)) {
      if (node.format & Number(key)) {
        formattedText = formatter(formattedText)
      }
    }

    return formattedText
  },
  nodeTypes: ['text'],
}
