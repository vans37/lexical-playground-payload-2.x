import type { Slide } from 'yet-another-react-lightbox'

import Image from 'next/image'
import {
  isImageFitCover,
  isImageSlide,
  useLightboxProps,
  useLightboxState,
} from 'yet-another-react-lightbox'

function isNextJsImage(slide: Slide) {
  return isImageSlide(slide) && typeof slide.width === 'number' && typeof slide.height === 'number'
}

export default function NextJsImage({
  offset,
  rect,
  slide,
}: {
  offset: number
  rect: any
  slide: Slide
}) {
  const {
    carousel: { imageFit },
    on: { click },
  } = useLightboxProps()

  const { currentIndex } = useLightboxState()

  const cover = isImageSlide(slide) && isImageFitCover(slide, imageFit)

  if (!isNextJsImage(slide)) return undefined

  const width = !cover
    ? Math.round(Math.min(rect.width, (rect.height / slide.height) * slide.width))
    : rect.width

  const height = !cover
    ? Math.round(Math.min(rect.height, (rect.width / slide.width) * slide.height))
    : rect.height

  return (
    <div style={{ height, position: 'relative', width }}>
      <Image
        alt=""
        draggable={false}
        fill
        loading="eager"
        onClick={offset === 0 ? () => click?.({ index: currentIndex }) : undefined}
        // placeholder={slide.blurDataURL ? 'blur' : undefined}
        sizes={`${Math.ceil((width / window.innerWidth) * 100)}vw`}
        src={`${process.env.NEXT_PUBLIC_PAYLOAD_URL}/${slide.src}`}
        style={{
          cursor: click ? 'pointer' : undefined,
          objectFit: cover ? 'cover' : 'contain',
        }}
      />
    </div>
  )
}
