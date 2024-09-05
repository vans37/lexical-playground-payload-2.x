'use client'
import React from 'react'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../../ui/carousel'
import { cn } from '../../../lib/utils'

export type AlignmentOptionType =
  | 'start'
  | 'center'
  | 'end'
  | ((viewSize: number, snapSize: number, index: number) => number)

export type BoxCarouselProps = {
  classNames?: {
    carousel?: string
    carouselContent?: string
    carouselImage?: string
    carouselItem?: string
  }
  navigationHidden?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  slides: any[]
  mouseEventsDisabled?: boolean
  slidesToScroll?: number
  align?: AlignmentOptionType
}

const BoxCarousel = ({
  classNames = {},
  navigationHidden = false,
  slides,
  mouseEventsDisabled,
  slidesToScroll = 1,
  align = 'center',
}: BoxCarouselProps) => {
  return (
    <Carousel
    className={cn(classNames.carousel, 'relative')}
    opts={{
      align,
      watchDrag: mouseEventsDisabled ? false : true,
      slidesToScroll,
    }}
    >
     <CarouselContent className={cn(classNames.carouselContent, 'm-0 p-0')}>
        {slides.map((slide, index) => {
          return (
            <CarouselItem key={index} className={cn(classNames.carouselItem)}>
              {slide}
            </CarouselItem>
          )
        })}
      </CarouselContent>

      {!navigationHidden && (
        <React.Fragment>
          <CarouselPrevious className="left-[1rem] hidden bg-wooden text-white hover:bg-indigo-600 hover:text-white md:flex" />
          <CarouselNext className="right-[1rem] bg-wooden hidden text-white hover:bg-indigo-600 hover:text-white md:flex" />
        </React.Fragment>
      )}
    </Carousel>
  )
}

export default BoxCarousel
