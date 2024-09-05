/* eslint-disable jsx-a11y/label-has-associated-control */

import React, { useCallback } from 'react'
import type { NodeKey } from 'lexical'
import { Button, Drawer } from 'payload/components/elements'

export type SelectImagesProps = {
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => Promise<void>
  handlePaste: (e: React.ClipboardEvent<HTMLDivElement>) => Promise<void>
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>
  toggleUploadsDrawer: () => void
  galleryKey: NodeKey
}

const SelectImageModal = React.forwardRef(
  (props: SelectImagesProps, ref: React.MutableRefObject<HTMLDivElement>) => {
    const { handleDrop, handlePaste, handleFileChange, toggleUploadsDrawer, galleryKey } = props
    const handleSelectUploads = useCallback(() => {
      toggleUploadsDrawer()
    }, [toggleUploadsDrawer])

    return (
      <Drawer title="Select images" slug={galleryKey}>
        <div className="select-images-drawer">
          <div
            className="drop-zone"
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onPaste={handlePaste}
            ref={ref}
          >
            <div className="select">
              <div>You can drop or paste images here</div>
              <label className='btn'  htmlFor="gallery-plugin-select-files">
                Select files
              </label>
             
              <input
                  id="gallery-plugin-select-files"
                  hidden
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                />
              <div>
                <Button onClick={handleSelectUploads}>Select uploads</Button>
              </div>
            </div>
          </div>
        </div>
      </Drawer>
    )
  },
)

export default SelectImageModal
