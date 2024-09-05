import React from 'react'
import { cn } from '../../../lib/utils'
import DynamicIcon from '../../dynamicIcon'
import Container from '../../shared/Container'

type IncentiveProps = {
  incentives: {
    svg?: string
    title: string
    description: string
  }[]
}

export default function Incentive({ incentives }: IncentiveProps) {
  return (
    <Container className="border-b py-16">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {incentives.map((incentive, id) => {
          const regex = /<svg/
          const isSvgCode = regex.test(incentive.svg)

          const iconCode = incentive.svg

          if (isSvgCode) {
            return (
              <div className="flex flex-row gap-4 py-4 items-center  justify-center" key={id}>
                <div className="h-12 w-12 flex justify-center items-center bg-gray-50 rounded-full">
                  <div
                    className="text-indigo-600 text-2xl w-[1.5rem] h-[1.5rem]"
                    dangerouslySetInnerHTML={{ __html: iconCode }}
                  />
                </div>
                <div
                  className={cn(
                    'lg:border-r border-gray-100',
                    id === incentives.length - 1 && 'border-none',
                  )}
                >
                  <p className="text-left max-w-64 text-slate-800 font-semibold mb-1">
                    {incentive.title}
                  </p>
                  <p className="text-left max-w-64 text-slate-500 text-sm">
                    {incentive.description}
                  </p>
                </div>
              </div>
            )
          } else {
            return (
              <div className="flex flex-row gap-4 py-4 items-center  justify-center" key={id}>
                <div className="h-12 w-12 flex justify-center items-center bg-gray-50 rounded-full">
                  <DynamicIcon icon={incentive.svg} className="text-indigo-600 text-2xl" />
                </div>
                <div
                  className={cn(
                    'lg:border-r border-gray-100',
                    id === incentives.length - 1 && 'border-none',
                  )}
                >
                  <p className="text-left max-w-64 text-slate-800 font-semibold mb-1">
                    {incentive.title}
                  </p>
                  <p className="text-left max-w-64 text-slate-500 text-sm">
                    {incentive.description}
                  </p>
                </div>
              </div>
            )
          }
        })}
      </div>
    </Container>
  )
}
