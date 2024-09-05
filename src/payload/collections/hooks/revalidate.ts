import type { GeneratedTypes } from 'payload'
import type { AfterChangeHook } from 'payload/dist/collections/config/types'
import type { PayloadRequest } from 'payload/types'

import { revalidate } from '../../utilities/revalidate'

const revalidateGlobals = (req: PayloadRequest) => {
  void revalidate({
    global: 'landing_page',
    payload: req.payload,
  })

  void revalidate({
    global: 'navigation',
    payload: req.payload,
  })
}

const revalidateCollection: AfterChangeHook = ({ collection, doc, req }) => {
  //revalidate current collection
  void revalidate({
    slug: doc.slug,
    collection: collection.slug,
    payload: req.payload,
  })

  //revalidate globals
  switch (collection.slug as keyof GeneratedTypes['collections']) {
    case 'products': {
      revalidateGlobals(req)
      break
    }

    case 'categories': {
      revalidateGlobals(req)
      break
    }

    case 'pages': {
      revalidateGlobals(req)
      break
    }

    default: {
      return
    }
  }
}

export default revalidateCollection
