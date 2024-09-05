import dynamic from 'next/dynamic'
import { cn } from '../../lib/utils'
import React from 'react'

const DynamicIcon = ({
  iconFamily = 'fa6',
  icon,
  className,
  ...rest
}: {
  iconFamily?: keyof typeof Icons
  icon: string
  className?: string
}) => {
  const Icons = {
    //@ts-expect-error
    fa6: dynamic(() => import('react-icons/fa6').then(mod => mod[icon])),
  }

  const Icon = iconFamily && icon ? Icons[iconFamily] : null

  if (!Icon) return <React.Fragment />

  return (
    <React.Fragment>
      <Icon {...rest} className={cn(className)} />
    </React.Fragment>
  )
}

export default DynamicIcon
