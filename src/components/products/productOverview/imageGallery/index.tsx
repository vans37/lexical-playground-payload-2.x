'use client'
import type { SlideImage } from 'yet-another-react-lightbox/dist/types'
import React, { useMemo, useState } from 'react'
import type { Media } from '../../../../payload-types'
import { AspectRatio } from '../../../shared/AspectRatio'
import { WrappedImage } from '../../../media'
import { Carousel, CarouselContent, CarouselItem } from '../../../ui/carousel'
import LightBox from '../../../lightbox'

export type ProductImagesProps = {
  id?: string
  image?: Media
}[]

const ProductImages = ({ images }: { images: ProductImagesProps }) => {
  const [activeImgId, setActiveImgId] = useState(0)
  const [isLightBoxOpen, setLightBoxOpen] = useState(false)

  const productImages = useMemo(() => images.map(item => item.image), [images])

  const slides: SlideImage[] = productImages.map(image => {
    const slide: SlideImage = {
      alt: image ? image.alt : '',
      src: image ? '/' + image.filename : '/not_found.png',
    }
    return slide
  })

  if (!images || images.length === 0) {
    return null
  }

  return (
    <React.Fragment>
      <div className="mx-auto mt-6">
        <div className="flex flex-col justify-between">
          <AspectRatio className="relative" ratio={1 / 1}>
            <WrappedImage
              props={{
                fill: true,
                imgClassName: 'object-center object-cover rounded-lg cursor-pointer',
                onClick: () => setLightBoxOpen(prev => !prev),
                resource: productImages[activeImgId],
              }}
            />
          </AspectRatio>
          {/* thumbnails */}
          <div className="flex flex-row my-4">
            <Carousel className="w-full">
              <CarouselContent>
                {productImages.map((image, index) => {
                  return (
                    <CarouselItem className="basis-1/2 lg:basis-1/4" key={image.id}>
                      <div
                        tabIndex={0}
                        role="button"
                        className="relative w-full h-[10rem]"
                        onClick={() => setActiveImgId(index)}
                        onKeyDown={e => {
                          if (e.key == 'Enter') {
                            setActiveImgId(index)
                          }
                        }}
                      >
                        <WrappedImage
                          props={{
                            fill: true,
                            imgClassName:
                              'w-full h-full rounded-lg object-cover object-center cursor-pointer',
                            resource: image,
                            size: 'thumbnail',
                          }}
                        />
                      </div>
                    </CarouselItem>
                  )
                })}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </div>
      {/* Lightbox */}
      <LightBox
        index={activeImgId}
        open={isLightBoxOpen}
        setOpen={setLightBoxOpen}
        slides={slides}
      />
    </React.Fragment>
  )
}

export default ProductImages
