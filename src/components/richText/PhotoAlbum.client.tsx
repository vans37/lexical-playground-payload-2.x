'use client'
import React from 'react'
import type { LayoutType, Photo, RenderPhotoProps } from 'react-photo-album'
import PhotoAlbum from 'react-photo-album'
import Image from 'next/image'
import Lightbox from 'yet-another-react-lightbox'
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen'
import Counter from 'yet-another-react-lightbox/plugins/counter'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import Captions from 'yet-another-react-lightbox/plugins/captions'

import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/counter.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'

function NextJsImage({
  photo,
  imageProps: { alt, title, sizes, className, onClick },
  wrapperStyle,
}: RenderPhotoProps) {
  return (
    <div style={{ ...wrapperStyle, position: 'relative' }}>
      <Image
        fill
        src={photo}
        placeholder={'blurDataURL' in photo ? 'blur' : undefined}
        {...{ alt, title, sizes, className, onClick }}
      />
    </div>
  )
}

export default function PhotoAlbumClient({
  photos,
  layout,
  columns,
}: {
  photos: Photo[]
  layout: LayoutType
  columns: number
}) {
  const [index, setIndex] = React.useState(-1)

  return (
    <React.Fragment>
      <PhotoAlbum
        layout={layout}
        photos={photos}
        renderPhoto={NextJsImage}
        defaultContainerWidth={1200}
        columns={columns}
        sizes={{ size: 'calc(100vw - 240px)' }}
        onClick={({ index: current }) => setIndex(current)}
      />
      <Lightbox
        index={index}
        slides={photos}
        open={index >= 0}
        close={() => setIndex(-1)}
        plugins={[Fullscreen, Counter, Thumbnails, Zoom, Captions]}
      />
    </React.Fragment>
  )
}
