'use server'

import { getPayloadClient } from '../../getPayload'

export async function createOrder(
  client_name: string,
  client_phone: string,
  client_message: string,
) {
  const payload = await getPayloadClient()

  try {
    await payload.create({
      collection: 'orders',
      data: {
        client_message,
        client_name,
        client_phone,
      },
    })

    return 200
  } catch (err) {
    return err.status
  }
}
