import type { Field } from 'payload/types'

import ResetStateComponent from './component'

const ResetLexicalState = (fieldName: string, pathToLexicalField: string, buttonTitle: string) => {
  const field: Field = {
    name: fieldName,
    type: 'text',
    admin: {
      components: {
        Field: ResetStateComponent,
      },
    },
    defaultValue: pathToLexicalField,
    custom: {
      resetTitle: buttonTitle
    }
  }

  return field
}

export default ResetLexicalState
