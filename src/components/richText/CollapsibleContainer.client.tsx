'use client'

import { Collapsible } from '@radix-ui/react-collapsible'
import React from 'react'

export default function CollapsibleContainer({
  childrenContent,
  isCollapsibleOpen = false,
}: {
  childrenContent: React.ReactNode
  isCollapsibleOpen: boolean
}) {
  const [isOpen, setIsOpen] = React.useState(isCollapsibleOpen)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      {childrenContent}
    </Collapsible>
  )
}
