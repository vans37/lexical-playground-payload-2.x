import { cn } from '../../lib/utils'

type HeadingVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export default function Heading({
  children,
  className = '',
  variant,
}: {
  children: React.ReactNode
  className?: string
  variant: HeadingVariant
}) {
  switch (variant) {
    case 'h1': {
      return (
        <h1
          className={cn(
            'lg:text-4xl leading-tight text-slate-800 font-semibold text-center lg:text-left',
            className,
          )}
        >
          {children}
        </h1>
      )
    }

    case 'h2': {
      return (
        <h2
          className={cn(
            'text-xl lg:text-3xl leading-tight text-slate-800 font-semibold text-center lg:text-left',
            className,
          )}
        >
          {children}
        </h2>
      )
    }

    case 'h3': {
      return (
        <h3
          className={cn(
            'text-xl lg:text-2xl leading-tight text-slate-800 font-semibold text-center lg:text-left',
            className,
          )}
        >
          {children}
        </h3>
      )
    }

    case 'h4': {
      return (
        <h4
          className={cn(
            'text-xl lg:text-xl leading-tight text-slate-800 font-semibold text-center lg:text-left',
            className,
          )}
        >
          {children}
        </h4>
      )
    }

    case 'h5': {
      return (
        <h5
          className={cn(
            'text-xl lg:text-xl leading-tight text-slate-800 font-semibold text-center lg:text-left',
            className,
          )}
        >
          {children}
        </h5>
      )
    }

    case 'h6': {
      return (
        <h6
          className={cn(
            'text-xl lg:text-lg leading-tight text-slate-800 font-semibold text-center lg:text-left',
            className,
          )}
        >
          {children}
        </h6>
      )
    }

    default: {
      return null
    }
  }
}
