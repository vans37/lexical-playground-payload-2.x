'use client'
import { useContext } from 'react'
import { FormDialogContext } from '../../context/form'
import { Dialog, DialogContent } from '../ui/dialog'
import BlockForm from './BlockForm'

export default function DialogForm() {
  const { open, setOpen } = useContext(FormDialogContext)

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent>
        <BlockForm />
      </DialogContent>
    </Dialog>
  )
}
