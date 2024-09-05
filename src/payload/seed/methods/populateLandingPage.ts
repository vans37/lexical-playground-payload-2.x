import type { Payload } from "payload"

import { MEDIA_FOLDER } from ".."
import { uploadMediaByFilePath, uploadMediaMultiple } from "../../utilities/utils"
import landingData from "../data/landingData"
import { PRODUCTS_LIMIT } from "./populateProducts"

const POPULAR_PRODUCTS_LIMIT = 10

const populateLandingPage = async (
  payload: Payload,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdProducts: any[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createdCategories: any[],
) => {
  //hero
  const heroImages = await uploadMediaMultiple(
    [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ...landingData.hero.images.map((v: any) => ({
        data: { alt: v.alt, focalX: 50, focalY: 50 },
        filePath: MEDIA_FOLDER + v.src,
      })),
    ],
    payload,
  )

  const images = heroImages.map(media => ({
    src: media.id,
  }))

  if (!images || images.length === 0) {
    throw new Error('Could not upload hero images in landing page')
  }

  const hero = {
    ...landingData.hero,
    images,
  }

  //products
  const popularProducts: {
    relationTo: 'products'
    value: number //id
  }[] = []

  if (!createdProducts || createdProducts.length === 0) {
    throw new Error('Could not populate related products in landing page')
  }

  if (POPULAR_PRODUCTS_LIMIT < PRODUCTS_LIMIT) {
    for (let i = 0; i < POPULAR_PRODUCTS_LIMIT; i++) {
      popularProducts.push({ relationTo: 'products', value: createdProducts[i].id })
    }
  } else {
    for (let i = 0; i < PRODUCTS_LIMIT; i++) {
      popularProducts.push({ relationTo: 'products', value: createdProducts[i].id })
    }
  }

  const productsData = {
    ...landingData.products,
    popular_products: popularProducts,
  }

  //categories

  if (!createdCategories || createdCategories.length === 0) {
    throw new Error('Could nod populate related categories in landing page')
  }

  const categoriesData = createdCategories.map(cat => ({
    relationTo: 'categories',
    value: cat.id,
  }))

  //meta upload files
  const metaImage = await uploadMediaByFilePath(payload, MEDIA_FOLDER + landingData.meta.image, {
    focalX: 50,
    focalY: 50,
  })

  const meta = {
    ...landingData.meta,
    image: metaImage.id,
    open_graph: {
      ...landingData.meta.open_graph,
      og_image: metaImage.id,
    },
  }

  try {
    await payload.updateGlobal({
      slug: 'landing_page',
      data: {
        ...landingData,
        categories: {
          categories: categoriesData,
        },
        hero,
        meta,
        products: productsData,
      },
      depth: 5,
    })
  } catch (err) {
    payload.logger.error(err)
  }
}

export default populateLandingPage