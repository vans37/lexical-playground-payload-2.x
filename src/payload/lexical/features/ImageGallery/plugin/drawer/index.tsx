/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import type { SanitizedCollectionConfig } from 'payload/types'
import React, { useEffect, useState } from 'react'
import adminRequest from '../../../../lib/api/adminRequest'
import type { PaginatedDocs } from 'payload/database'
import type { Media } from '../../../../../../payload-types'
import { MEDIA_COLLECTION_SLUG, SELECT_MEDIA_MODAL_SLUG } from '..'
import { useConfig } from 'payload/components/utilities'
import Pagination from './pagination'
import { Button } from 'payload/components/elements'
import type { NodeKey } from 'lexical'
import { useModal } from '@faceless-ui/modal'
import type { UploadsSelection } from '../store'
import { useGallery } from '../store'

const UploadImage = ({ url }: { url: string }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  return (
    <React.Fragment>
      {!isLoaded && <div className="image-skeleton" />}
      <img
        onLoad={() => setIsLoaded(true)}
        src={url}
        style={{ display: isLoaded ? 'block' : 'none' }}
        alt=""
      />
    </React.Fragment>
  )
}

const UploadsDrawer = ({
  collectionConfig,
  galleryNodeKey,
}: {
  collectionConfig: SanitizedCollectionConfig
  galleryNodeKey: NodeKey
}) => {
  const [totalCount, setTotalCount] = useState(0)
  const [limit, setLimit] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectionCount, setSelectionCount] = useState(0)
  const [uploads, setUploads] = useState<Media[]>([])
  const [selectAllDisabled, setSelectAllDisabled] = useState(false)
  const [noUploads, setNoUploads] = useState(false)
  const { closeModal } = useModal()
  const { serverURL } = useConfig()

  const { selection, setShouldInsertMedia, resetSelection } = useGallery(galleryNodeKey)
  const [uncomfirmedSelection, setUncomfirmedSelection] = useState<UploadsSelection>(selection)

  useEffect(() => {
    setSelectionCount(uncomfirmedSelection.length)
    if (uncomfirmedSelection.length === totalCount) {
      setSelectAllDisabled(true)
    } else {
      setSelectAllDisabled(false)
    }
  }, [totalCount, uncomfirmedSelection.length])

  useEffect(() => {
    const getMedia = async () => {
      const response = await adminRequest<PaginatedDocs<Media>>(
        `${serverURL}/api/${MEDIA_COLLECTION_SLUG}?limit=${limit}&page=${currentPage}`,
      )
      if (response?.docs?.length > 0) {
        setUploads([...response.docs])
        setTotalCount(response.totalDocs)
        setNoUploads(false)
      } else {
        setNoUploads(true)
      }
    }

    void getMedia()
  }, [currentPage, limit, serverURL, setUploads])

  const isSelected = (selection: UploadsSelection, id: number): boolean => {
    return !!selection.filter(selectionID => selectionID === id).length
  }

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(parseInt(e.currentTarget.value))
    setCurrentPage(1)
  }

  const adminThumbnail = collectionConfig?.upload?.adminThumbnail || 'adminThumbnail'

  return (
    <div className="drawer-upload">
      <div className="controls">
        <Pagination
          onPageChange={page => {
            setUploads([])
            setCurrentPage(page)
          }}
          totalCount={totalCount}
          siblingCount={2}
          currentPage={currentPage}
          pageSize={limit}
          className=""
        />
        <div className="buttons">
          <Button
            disabled={selection.length === uncomfirmedSelection.length}
            onClick={() => {
              resetSelection([...uncomfirmedSelection])
              setShouldInsertMedia(true)
              closeModal(SELECT_MEDIA_MODAL_SLUG)
              closeModal(galleryNodeKey)
            }}
          >
            Confirm
          </Button>
          <Button
            disabled={selectAllDisabled}
            onClick={() => {
              setUncomfirmedSelection(uploads.map(v => v.id))
            }}
          >
            Select All
          </Button>
          <Button
            disabled={uncomfirmedSelection.length === 0}
            onClick={() => {
              setUncomfirmedSelection([])
              resetSelection([])
              setShouldInsertMedia(true)
            }}
          >
            Clear selection
          </Button>
        </div>
        <select
          name="select-limit"
          onChange={e => {
            handleLimitChange(e)
          }}
        >
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={100}>150</option>
          <option value={100}>200</option>
        </select>
        <div className="selection-count">
          Selected: <span className="counter">{selectionCount}</span>
        </div>
      </div>
      <div className="content">
        {uploads.length > 0 &&
          uploads.map(upload => {
            if (upload?.mimeType?.includes('image')) {
              const url = upload?.sizes?.[adminThumbnail as string]?.url || upload.url
              return (
                // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                <div
                  key={upload.id}
                  className="media"
                  onClick={() => {
                    if (isSelected(uncomfirmedSelection, upload.id)) {
                      setUncomfirmedSelection(prev => prev.filter(id => id !== upload.id))
                    } else {
                      setUncomfirmedSelection(prev => [...prev, upload.id])
                    }
                  }}
                >
                  <UploadImage url={url} />
                  <input
                    className="select"
                    type="checkbox"
                    checked={isSelected(uncomfirmedSelection, upload.id)}
                    readOnly
                  />
                </div>
              )
            }
            return null
          })}
        {!noUploads && uploads.length === 0 && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            Loading...
          </div>
        )}
        {noUploads && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            Empty collection
          </div>
        )}
      </div>
    </div>
  )
}

export default UploadsDrawer
