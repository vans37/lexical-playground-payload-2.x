import type { GeneratedTypes, Payload } from 'payload'

const clearMediaCollection = async (
  payload: Payload,
  collection?: keyof GeneratedTypes['collections'],
) => {
  await payload.delete({
    collection: collection ?? 'media',
    where: {},
  })
}

export default clearMediaCollection
