import { Button } from 'payload/components/elements'
import { useFormFields } from 'payload/components/forms'
import * as React from 'react'

import { toast } from 'react-toastify'

const DEFAULT_EDITOR_STATE = {
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        children: [],
      },
    ],
    direction: 'ltr',
  },
}

const TOAST_MESSAGE = 'Save document and reload page for changes to apply!'

const ResetStateComponent = props => {
  const { defaultValue, custom } = props

  const { field, dispatch } = useFormFields(([fields, dispatch]) => ({
    field: fields[defaultValue],
    dispatch,
  }))

  if (!defaultValue || !field) {
    return null
  }

  const handleOnClick = () => {
    if (field) {
      dispatch({
        type: 'UPDATE',
        path: defaultValue,
        value: DEFAULT_EDITOR_STATE,
      })
      toast.info(TOAST_MESSAGE)
    }
  }

  return (
    <React.Fragment>
      <div style={{ margin: '4px 8px'}}>
        <Button onClick={handleOnClick}>{custom.resetTitle}</Button>
      </div>
    </React.Fragment>
  )
}

export default ResetStateComponent
