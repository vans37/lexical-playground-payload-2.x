// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useCallback } from 'react'
import type { NodeKey } from 'lexical'
import { create } from 'zustand'
import type { Media } from '../../../../../../payload-types'

export const useGalleryStore = create<{
  state: States
  dispatch: (action: Action) => void
}>(set => ({
  state: {},
  dispatch: (action: Action) => set(state => ({ state: galleryReducer(state.state, action) })),
}))

export type UploadsSelection = number[]

export type FileWithResult = {
  result: string
  file: File
}

export type State = {
  uploads: Media[]
  selection: UploadsSelection
  shouldInsertMedia: boolean
  files: FileWithResult[]
  isModalOpen: boolean
}

export type Action =
  | { type: 'SET_SELECTION'; galleryKey: NodeKey; selection: UploadsSelection }
  | { type: 'RESET_SELECTION'; galleryKey: NodeKey; selection: UploadsSelection }
  | { type: 'CLEAR_SELECTION'; galleryKey: NodeKey }
  | { type: 'DELETE_SELECTION'; galleryKey: NodeKey; id: number }
  | { type: 'SET_FILES'; galleryKey: NodeKey; files: FileWithResult[] }
  | { type: 'CLEAR_FILES'; galleryKey: NodeKey }
  | { type: 'DELETE_FILE'; galleryKey: NodeKey; result: string }
  | { type: 'TOGGLE_MODAL'; galleryKey: NodeKey; value: boolean }
  | { type: 'SET_SHOULD_INSERT_NODES'; galleryKey: NodeKey; value: boolean }

export type States = { [galleryKey: NodeKey]: State }

const initialState: State = {
  uploads: [],
  selection: [],
  shouldInsertMedia: false,
  files: [],
  isModalOpen: false,
}

const galleryReducer = (state: States, action: Action) => {
  const { galleryKey } = action
  const activeGalleryState = state[galleryKey] || initialState

  switch (action.type) {
    case 'SET_SELECTION': {
      const selection = action.selection.filter(id => !activeGalleryState.selection.includes(id))
      return {
        ...state,
        [galleryKey]: {
          ...activeGalleryState,
          selection: [...activeGalleryState.selection, ...selection],
        },
      }
    }
    case 'RESET_SELECTION': {
      return {
        ...state,
        [galleryKey]: { ...activeGalleryState, selection: [...action.selection] },
      }
    }
    case 'CLEAR_SELECTION': {
      return {
        ...state,
        [galleryKey]: { ...activeGalleryState, selection: [] },
      }
    }
    case 'DELETE_SELECTION': {
      const filtered = activeGalleryState?.selection?.filter(id => id !== action.id)
      return {
        ...state,
        [galleryKey]: { ...activeGalleryState, selection: filtered },
      }
    }
    case 'SET_SHOULD_INSERT_NODES': {
      return {
        ...state,
        [galleryKey]: { ...activeGalleryState, shouldInsertMedia: action.value },
      }
    }
    case 'SET_FILES': {
      const files = action.files.filter(file => !activeGalleryState.files.includes(file))
      return {
        ...state,
        [galleryKey]: { ...activeGalleryState, files: [...activeGalleryState.files, ...files] },
      }
    }
    case 'CLEAR_FILES': {
      return {
        ...state,
        [galleryKey]: { ...activeGalleryState, files: [] },
      }
    }
    case 'DELETE_FILE': {
      const filtered = activeGalleryState?.files?.filter(f => f.result !== action.result)
      return {
        ...state,
        [galleryKey]: { ...activeGalleryState, files: filtered },
      }
    }
    case 'TOGGLE_MODAL': {
      return {
        ...state,
        [galleryKey]: { ...activeGalleryState, isModalOpen: action.value },
      }
    }
  }
}

export const useGallery = (galleryKey: NodeKey) => {
  const dispatch = useGalleryStore(state => state.dispatch)
  const state = useGalleryStore(state => state.state)
  const setSelection = useCallback(
    (selection: UploadsSelection, key?: NodeKey) => {
      if (key) {
        dispatch({ type: 'SET_SELECTION', galleryKey: key, selection })
      } else {
        dispatch({ type: 'SET_SELECTION', galleryKey, selection })
      }
    },
    [dispatch, galleryKey],
  )

  const resetSelection = useCallback(
    (selection: UploadsSelection, key?: NodeKey) => {
      if (key) {
        dispatch({ type: 'RESET_SELECTION', galleryKey: key, selection })
      } else {
        dispatch({ type: 'RESET_SELECTION', galleryKey, selection })
      }
    },
    [dispatch, galleryKey],
  )

  const clearSelection = useCallback(
    (key?: NodeKey) => {
      if (key) {
        dispatch({ type: 'CLEAR_SELECTION', galleryKey: key })
      } else {
        dispatch({ type: 'CLEAR_SELECTION', galleryKey })
      }
    },
    [dispatch, galleryKey],
  )

  const setShouldInsertMedia = useCallback(
    (value: boolean, key?: NodeKey) => {
      if (key) {
        dispatch({ type: 'SET_SHOULD_INSERT_NODES', galleryKey: key, value })
      } else {
        dispatch({ type: 'SET_SHOULD_INSERT_NODES', galleryKey, value })
      }
    },
    [dispatch, galleryKey],
  )

  const deleteSelection = useCallback(
    (id: number, key?: NodeKey) => {
      if (key) {
        dispatch({ type: 'DELETE_SELECTION', galleryKey: key, id })
      } else {
        dispatch({ type: 'DELETE_SELECTION', galleryKey, id })
      }
    },
    [dispatch, galleryKey],
  )

  const setFiles = useCallback(
    (files: FileWithResult[], key?: NodeKey) => {
      if (key) {
        dispatch({ type: 'SET_FILES', galleryKey: key, files })
      } else {
        dispatch({ type: 'SET_FILES', galleryKey, files })
      }
    },
    [dispatch, galleryKey],
  )

  const clearFiles = useCallback(
    (key?: NodeKey) => {
      if (key) {
        dispatch({ type: 'CLEAR_FILES', galleryKey: key })
      } else {
        dispatch({ type: 'CLEAR_FILES', galleryKey })
      }
    },
    [dispatch, galleryKey],
  )

  const deleteFile = useCallback(
    (result: string, key?: NodeKey) => {
      if (key) {
        dispatch({ type: 'DELETE_FILE', galleryKey: key, result })
      } else {
        dispatch({ type: 'DELETE_FILE', galleryKey, result })
      }
    },
    [dispatch, galleryKey],
  )

  const toggleModal = useCallback(
    (key?: NodeKey) => {
      if (key) {
        dispatch({ type: 'TOGGLE_MODAL', galleryKey: key, value: !state[galleryKey]?.isModalOpen })
      } else {
        dispatch({ type: 'TOGGLE_MODAL', galleryKey, value: !state[galleryKey]?.isModalOpen })
      }
    },
    [dispatch, galleryKey, state],
  )

  return {
    uploads: state[galleryKey]?.uploads || [],
    selection: state[galleryKey]?.selection || [],
    files: state[galleryKey]?.files || [],
    shouldInsertMedia: state[galleryKey]?.shouldInsertMedia || false,
    isModalOpen: state[galleryKey]?.isModalOpen || false,
    toggleModal,
    setSelection,
    resetSelection,
    clearSelection,
    deleteSelection,
    setShouldInsertMedia,
    setFiles,
    clearFiles,
    deleteFile,
  }
}
