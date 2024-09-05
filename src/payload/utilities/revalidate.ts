import type { Payload } from 'payload'

export const revalidate = async (args: {
  collection?: string
  global?: string
  payload: Payload
  slug?: string
}): Promise<void> => {
  const { slug, collection, global, payload } = args

  payload.logger.info(slug, collection, global)

  if (global) {
    try {
      const res = await fetch(
        `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/revalidate?secret=${process.env.REVALIDATION_KEY}&global=${global}`,
      )

      if (res.ok) {
        payload.logger.info(`Revalidated global ${global}`)
      } else {
        payload.logger.error(`Error revalidating global ${global}`)
      }
    } catch (err: unknown) {
      payload.logger.error(`Error hitting revalidate route for global ${global}`)
    }
  } else if (slug && collection) {
    try {
      const res = await fetch(
        `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/revalidate?secret=${process.env.REVALIDATION_KEY}&collection=${collection}&slug=${slug}`,
      )

      if (res.ok) {
        payload.logger.info(`Revalidated page '${slug}' in collection ${collection}`)
      } else {
        payload.logger.error(
          `Error revalidating page '${slug}' in collection ${collection}`,
        )
      }
    } catch (err: unknown) {
      payload.logger.error(
        `Error hitting revalidate route for page '${slug}' in collection ${collection}`,
      )
    }
  }
}
