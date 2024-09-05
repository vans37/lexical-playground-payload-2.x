/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback, useMemo, useState } from 'react'
import * as React from 'react'
import Modal from '../../../lib/ui/Modal'

export default function useModal(): [
  JSX.Element | null,
  (title: string, showModal: (onClose: () => void) => JSX.Element) => void,
] {
  const [modalContent, setModalContent] = useState<{
    closeOnClickOutside: boolean
    content: JSX.Element
    title: string
  } | null>(null)

  const onClose = useCallback(() => {
    setModalContent(null)
  }, [])

  const modal = useMemo(() => {
    if (modalContent === null) {
      return null
    }
    const { closeOnClickOutside, content, title } = modalContent
    return (
      <Modal closeOnClickOutside={closeOnClickOutside} onClose={onClose} title={title}>
        {content}
      </Modal>
    )
  }, [modalContent, onClose])

  const showModal = useCallback(
    (
      title: string,
      // eslint-disable-next-line no-shadow
      getContent: (onClose: () => void) => JSX.Element,
      closeOnClickOutside = false,
    ) => {
      setModalContent({
        closeOnClickOutside,
        content: getContent(onClose),
        title,
      })
    },
    [onClose],
  )

  return [modal, showModal]
}
