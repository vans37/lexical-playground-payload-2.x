import type { SanitizedEditorConfig } from '@payloadcms/richtext-lexical'
import type { SerializedEditorState } from 'lexical'
import type { FieldPermissions } from 'payload/auth'
import type { FieldTypes } from 'payload/config'
import type { RichTextFieldProps } from 'payload/types'

export type FieldProps = RichTextFieldProps<SerializedEditorState, AdapterProps, AdapterProps> & {
  fieldTypes: FieldTypes
  indexPath: string
  path?: string
  permissions: FieldPermissions
}

export interface AdapterProps {
  editorConfig: SanitizedEditorConfig
}
