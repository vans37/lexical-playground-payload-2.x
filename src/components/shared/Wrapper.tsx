import { cn } from '../../lib/utils'

export default function Wrapper({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={cn('my-16 lg:my-32', className)}>{children}</div>
}
