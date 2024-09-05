'use client'
import React, { useMemo } from 'react'
import type { LandingPage, Media } from '../../../payload-types'
import type { WrappedCarouselSlide } from '../../carousel/imageCarousel'
import ImageCarousel from '../../carousel/imageCarousel'
import HeroButton from './button'
import Container from '../../shared/Container'

type HeroProps = LandingPage['hero']

export default function Hero({ images, subtitle, title }: HeroProps) {
  const slides = useMemo(() => {
    return images.map(img => {
      const slide: WrappedCarouselSlide = {
        image: img.src as Media,
      }
      return slide
    })
  }, [images])

  return (
    <Container className="my-8 bg-gray-50 px-16 py-16 rounded-lg">
      <div className="flex flex-col lg:flex-row">
        <div className="max-w-xl flex flex-col justify-center items-center lg:items-start ">
          <h1 className="text-3xl md:text-5xl text-slate-700 font-bold my-16 lg:my-4 max-w-xl text-center lg:text-left">
            {title}
          </h1>
          <div className="flex flex-col">
            <div className="text-lg text-slate-700 mr-4 max-w-md text-center  lg:text-left">
              <p>{subtitle}</p>
            </div>
            <HeroButton className="my-1" />
          </div>
        </div>
        <div className="max-w-3xl w-full">
          <ImageCarousel enableNavigationBtns navPosition="bottom" slides={slides} />
        </div>
      </div>
    </Container>
  )
}
