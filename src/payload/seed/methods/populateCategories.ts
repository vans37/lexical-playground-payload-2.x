import type { Payload } from "payload"

import { MEDIA_FOLDER } from ".."
import { uploadMediaByFilePath } from "../../utilities/utils"
import categoriesData from "../data/categoryData"

const populateCategories = async (payload: Payload) => {
  await payload.delete({
    collection: 'categories',
    where: {},
  })

  return [
    ...(await Promise.all(
      categoriesData.data.map(async cat => {
        const media = await uploadMediaByFilePath(payload, MEDIA_FOLDER + cat.image, {
          focalX: 50,
          focalY: 50,
        })

        return payload.create({
          collection: 'categories',
          data: {
            image: media.id as unknown as number,
            title: cat.title,
          },
        })
      }),
    )),
  ]
}

export default populateCategories