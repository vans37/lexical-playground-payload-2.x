'use client'
import type { SlideImage } from 'yet-another-react-lightbox'

import Lightbox from 'yet-another-react-lightbox'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import 'yet-another-react-lightbox/plugins/thumbnails.css'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'

import NextJsImage from './nextImage'

export default function LightBox({
  index = 0,
  open,
  setOpen,
  slides,
}: {
  index: number
  open: boolean
  setOpen: (v: boolean) => void
  slides: SlideImage[] | undefined
}) {
  return (
    <Lightbox
      close={() => setOpen(false)}
      index={index}
      open={open}
      plugins={[Thumbnails, Zoom]}
      render={{
        slide: NextJsImage,
      }}
      slides={slides}
    />
  )
}
