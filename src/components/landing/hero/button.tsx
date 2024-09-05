'use client'

import { useContext } from 'react'
import { FormDialogContext } from '../../../context/form'
import { cn } from '../../../lib/utils'
import { Button } from '../../ui/button'

export default function HeroButton({
  className,
  title = 'Buy',
}: {
  className?: string
  title?: string
}) {
  const { setOpen } = useContext(FormDialogContext)

  return (
    <div className="flex justify-center my-4 lg:w-46 self-center lg:self-start">
      <Button className={cn('bg-indigo-600 w-32', className)} onClick={() => setOpen(true)}>
        {title}
      </Button>
    </div>
  )
}
