import type { Payload } from 'payload'

import dotenv from 'dotenv'
import express from 'express'
import next from 'next'
import nextBuild from 'next/dist/build'
import path from 'path'

import type { UserRoles } from './payload/collections/Users'
import type { User } from './payload-types'

import { getPayloadClient } from './getPayload'

dotenv.config({
  path: path.resolve(__dirname, '../.env'),
})

const app = express()
const PORT = process.env.PORT || 3000

const createUser = async (payload: Payload) => {
  const email = process.env.USER_EMAIL
  const password = process.env.USER_PASSWORD
  const role = process.env.USER_ROLE
  const firstName = process.env.USER_FIRST_NAME
  const lastName = process.env.USER_LAST_NAME
  const apiKey = process.env.USER_API_KEY

  const user = await payload.find({
    collection: 'users',
    where: {
      email: {
        equals: email,
      },
    },
  })

  if (user?.docs?.length > 0) {
    payload.logger.info(
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-base-to-string
      `User: ${user.docs[0].firstName} ${user.docs[0].lastName} exists, skipping creation`,
    )
    return
  } else {
    const res = await payload.create({
      collection: 'users',
      data: {
        apiKey,
        email,
        enableAPIKey: true,
        firstName,
        lastName,
        password,
        roles: ['editor', role as UserRoles],
      },
    }) as unknown as User  

    if (res.id) {
      payload.logger.info(`Successfully created User: ${res.firstName} ${res.lastName}`)
    } else {
      payload.logger.error(`Error creating User: ${res.firstName} ${res.lastName} `)
    }
  }
}

const start = async (): Promise<void> => {
  const payload = await getPayloadClient({
    initOptions: {
      express: app,
      onInit: async newPayload => {
        await createUser(newPayload)
        newPayload.logger.info(`Payload Admin URL: ${newPayload.getAdminURL()}`)
      },
    },
  })

  if (process.env.NEXT_BUILD) {
    app.listen(PORT, async () => {
      payload.logger.info(`Next.js is now building...`)
      // @ts-expect-error
      await nextBuild(path.join(__dirname, '..'))
      process.exit()
    })

    return
  }

  const nextApp = next({
    dev: process.env.NODE_ENV !== 'production',
  })

  const nextHandler = nextApp.getRequestHandler()

  app.use((req, res) => nextHandler(req, res))

  void nextApp.prepare().then(() => {
    payload.logger.info('Next.js started')

    // eslint-disable-next-line @typescript-eslint/require-await
    app.listen(PORT, async () => {
      payload.logger.info(`Next.js App URL: ${process.env.PAYLOAD_PUBLIC_SERVER_URL}`)
    })
  })
}

void start()
