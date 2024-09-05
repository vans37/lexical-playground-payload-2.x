'use client'
import type { ReactNode } from 'react'

import { createContext, useState } from 'react'

interface FormDialog {
  open: boolean
  setOpen: (v: boolean) => void
}

const defaultState: FormDialog = {
  open: false,
  setOpen: () => {},
}

export const FormDialogContext = createContext(defaultState)

const FormDialogContextProvider = ({ children }: { children: ReactNode }) => {
  const [dialogOpen, setDialogOpen] = useState(defaultState.open)

  const setOpen = () => setDialogOpen(prev => !prev)

  return (
    <FormDialogContext.Provider
      value={{
        open: dialogOpen,
        setOpen,
      }}
    >
      {children}
    </FormDialogContext.Provider>
  )
}

export default FormDialogContextProvider
