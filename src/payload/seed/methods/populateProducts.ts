import type { Payload } from 'payload'

import fs from 'fs'
import path from 'path'

import { MEDIA_FOLDER } from '..'
import { uploadMediaMultiple } from '../../utilities/utils'
import productData from '../data/productData'

export const PRODUCTS_LIMIT = 10
const productsImages = [
  'c-d-x-PDX_a_82obo-unsplash.jpg',
  'daniel-korpai-hbTKIbuMmBI-unsplash.jpg',
  'domino-studio-164_6wVEHfI-unsplash.jpg',
  'eniko-kis-KsLPTsYaqIQ-unsplash.jpg',
  'giorgio-trovato-K62u25Jk6vo-unsplash.jpg',
]
const productCategories = ['Glasses', 'T-shirts', 'Electronics', 'Books', 'Laptops']

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const populateProducts = async (payload: Payload, createdCategories: any[]) => {
  await payload.delete({
    collection: 'products',
    where: {},
  })

  const productCreationPromises = []

  for (let i = 0; i < PRODUCTS_LIMIT; i++) {
    const currProduct = productData.data

    const title = currProduct.title.replace('$', i.toString())
    const shortDescription = currProduct.short_description.replace('$', i.toString())

    const files = await uploadMediaMultiple(
      [
        ...productsImages.map(path => ({
          data: { focalX: 50, focalY: 50 },
          filePath: MEDIA_FOLDER + `/${path}`,
        })),
      ],
      payload,
    )

    const images = files.map(file => ({ image: file.id }))
    //generate 1 to 3 categories for each product
    const categories = []
    const catCount = Math.floor(Math.random() * 3 + 1)

    for (let i = 0; i < catCount; i++) {
      const catId = Math.floor(Math.random() * (productCategories.length - 1) + 1)
      const cat = productCategories[catId]
      //find already created categories with the title we need, cat title should be unique
      const catItem = createdCategories.filter(v => v.title.toLowerCase() === cat.toLowerCase())[0]
      categories.push(catItem)
    }

    const meta = {
      description: shortDescription,
      image: images[0].image,
      open_graph: {
        og_image: images[0].image,
        og_title: title,
      },
      title,
    }

    //read description file
    const fileDescription = fs.readFileSync(
      path.resolve(__dirname, '../data/productData/product_description.lexical'),
      { encoding: 'utf-8' },
    )

    const fileJson = JSON.parse(fileDescription)

    /* 
      in order to not use lexical headless to parse state 
      from external file we can remove editorState prop manually
      to save editor state
    */

    const parsedState = {
      ...fileJson.editorState,
    }

    const data = {
      categories: [...categories.map(cat => cat.id)],
      description: parsedState,
      images,
      meta,
      shortDescription,
      status: 'published',
      title,
    }

    const product = payload.create({
      collection: 'products',
      //@ts-expect-error
      data,
    })

    productCreationPromises.push(product)
  }

  return await Promise.all(productCreationPromises)
}

export default populateProducts
