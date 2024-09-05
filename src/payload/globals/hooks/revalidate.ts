import type { SanitizedGlobalConfig } from 'payload/dist/globals/config/types'
import type { PayloadRequest } from 'payload/types'
import { revalidate } from '../../utilities/revalidate'

const revalidateGlobal = (
  {
    global,
    req,
  }: {
    global?: SanitizedGlobalConfig
    req: PayloadRequest
  },
  slug?: string,
) => {
  if (global) {
    revalidate({
      global: global.slug,
      payload: req.payload,
    })
  } else if (slug) {
    revalidate({
      global: slug,
      payload: req.payload,
    })
  }
}

export default revalidateGlobal
