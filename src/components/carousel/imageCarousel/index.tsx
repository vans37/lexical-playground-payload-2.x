'use client'
import Autoplay from 'embla-carousel-autoplay'
import React, { useRef, useState } from 'react'
import type { Media } from '../../../payload-types'
import { cn, replaceOriginWithServerUrl } from '../../../lib/utils'
import { WrappedImage } from '../../media'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '../../ui/carousel'

export interface WrappedCarouselSlide {
  caption?: string | undefined
  image: Media
}

const ImageCarousel = ({
  classNames = {},
  delay = 4000,
  enableNavigationBtns = false,
  loop = false,
  navPosition = 'side',
  slides,
  mouseEventsDisabled,
  autoPlay,
  size,
}: {
  autoPlay?: boolean
  classNames?: {
    carousel?: string
    carouselContent?: string
    carouselImage?: string
    carouselItem?: string
  }
  delay?: number
  enableNavigationBtns?: boolean
  loop?: boolean
  navPosition?: 'bottom' | 'side'
  slides: WrappedCarouselSlide[]
  mouseEventsDisabled?: boolean
  size?: keyof Media['sizes']
}) => {
  const plugin = useRef(Autoplay({ delay, stopOnInteraction: true }))

  const [slideId, setSlideId] = useState(0)
  const [open, setOpen] = useState(false)

  if (!slides || slides?.length == 0) {
    return null
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault()
    const itemData = e.currentTarget.getAttribute('data-id') || '0'
    setSlideId(parseInt(itemData))
    setOpen(true)
  }

  return (
    <Carousel
      className={cn(classNames.carousel, 'relative')}
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
      {...(autoPlay ? { plugins: [plugin.current] } : {})}
      opts={{
        watchDrag: mouseEventsDisabled ? false : slides?.length > 1 ? true : false,
        loop,
      }}
    >
      <CarouselContent className={cn(classNames.carouselContent)}>
        {slides.map((slide, id) => {
          return (
            <CarouselItem
              className={cn(classNames.carouselItem, 'relative h-[30rem] w-full')}
              data-id={id}
              key={id}
              onClick={e => handleClick(e)}
            >
              <WrappedImage
                props={{
                  alt: slide.image.alt,
                  fill: true,
                  imgClassName: cn(
                    slides?.length > 1 ? 'cursor-pointer' : 'cursor-normal',
                    'object-contain object-center',
                    classNames.carouselImage,
                  ),
                  src: size? replaceOriginWithServerUrl(slide.image.sizes[size].url): replaceOriginWithServerUrl(slide.image.url),
                }}
              />
            </CarouselItem>
          )
        })}
      </CarouselContent>
      {enableNavigationBtns && navPosition === 'side' && slides?.length > 1 && (
        <React.Fragment>
          <CarouselPrevious className="-left-[1rem]" />
          <CarouselNext className="-right-[1rem]" />
        </React.Fragment>
      )}
      {enableNavigationBtns && navPosition === 'bottom' && slides?.length > 1 && (
        <React.Fragment>
          <div className="absolute -bottom-[4rem] flex h-16 w-24 flex-row items-center justify-between">
            <CarouselPrevious className="static hidden translate-y-0 bg-wooden text-white hover:bg-indigo-600 hover:text-white lg:flex" />
            <CarouselNext className="static hidden translate-y-0 bg-wooden text-white hover:bg-indigo-600 hover:text-white lg:flex" />
          </div>
        </React.Fragment>
      )}
    </Carousel>
  )
}

export default ImageCarousel
