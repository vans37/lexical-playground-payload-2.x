'server only'
import type { Payload } from 'payload'

import { clearPublicFolder, uploadMediaMultiple } from '../utilities/utils'
import clearMediaCollection from './methods/clearMediaCollection'
import populateCategories from './methods/populateCategories'
import populateLandingPage from './methods/populateLandingPage'
import populateMenu from './methods/populateMenu'
import populateProducts from './methods/populateProducts'

export const MEDIA_FOLDER = __dirname + '/media/'
export const PUBLIC_FOLDER = '../../public'

const miscMedia = ['not_found.png', 'logo.png']

export const seed = async (payload: Payload): Promise<void> => {
  payload.logger.info('Seeding database...')

  clearPublicFolder(PUBLIC_FOLDER)

  await clearMediaCollection(payload)

  await uploadMediaMultiple(
    [...miscMedia.map(m => ({ data: { focalX: 50, focalY: 50 }, filePath: MEDIA_FOLDER + m }))],
    payload,
  )

  const categories = await populateCategories(payload)

  const products = await populateProducts(payload, categories)

  await populateLandingPage(payload, products, categories)

  await populateMenu(payload, products)

  payload.logger.info('Seeded database successfully!')
}
