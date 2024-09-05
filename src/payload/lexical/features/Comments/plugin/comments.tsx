import { useAuth } from 'payload/dist/admin/components/utilities/Auth'
import type { LexicalComment, User } from '../../../../../payload-types'
import type { PaginatedDocs } from 'payload/database'
import type { CommentStore } from '../../../lib/commenting'
import adminRequest from '../../../lib/api/adminRequest'

export function useCollabAuthorName(): string {
  const { user } = useAuth<User>()
  return `${user.firstName} ${user.lastName}`
}

export const COLLECTION_SLUG = 'lexical-comments'

export const getCommentsFromCollection = async (hash: number) => {
  if (!hash || isNaN(hash)) {
    throw new Error('Hash is not set or its type is not a number')
  }

  const items = await adminRequest<PaginatedDocs<LexicalComment>>(
    `/api/${COLLECTION_SLUG}?where[hash][equals]=${hash}`,
  )

  return items?.docs[0]?.comments
}

export const pushCommentsToCollection = async ({
  comments,
  hash,
}: {
  comments: string
  hash: number
}) => {
  if (!hash || isNaN(hash)) {
    throw new Error('Hash is not set or its type is not a number')
  }

  try {
    const itemId = (
      await adminRequest<PaginatedDocs<LexicalComment>>(
        `/api/${COLLECTION_SLUG}?where[hash][equals]=${hash}`,
      )
    ).docs[0].id

    if (!itemId) {
      throw new Error(`Comment with hash ${hash} does not exist`)
    }

    await adminRequest<LexicalComment>(`/api/${COLLECTION_SLUG}/${itemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hash: hash.toString(),
        comments,
      }),
    })
  } catch (err) {
    throw new Error(`${err}`)
  }
}

export const saveComments = (commentStore: CommentStore, hash: number) => {
  if (!hash || isNaN(hash)) {
    throw new Error('Hash is not set or its type is not a number')
  }

  const comments = commentStore.getComments()
  const serialized = JSON.stringify(comments)

  void pushCommentsToCollection({
    comments: serialized,
    hash,
  })
}

export const prepareCommentsCollection = async (hash: number) => {
  if (!hash || isNaN(hash)) {
    throw new Error('Hash is not set or its type is not a number')
  }

  try {
    const checkCollection = await adminRequest<PaginatedDocs<LexicalComment>>(
      `/api/${COLLECTION_SLUG}`,
    )

    if (!checkCollection?.docs) {
      throw new Error(`Failed to get collection ${COLLECTION_SLUG}`)
    }

    const collectionComments = await adminRequest<PaginatedDocs<LexicalComment>>(
      `/api/${COLLECTION_SLUG}?where[hash][equals]=${hash}`,
    )

    if (collectionComments?.docs?.length === 0) {
      await adminRequest<LexicalComment>(`/api/${COLLECTION_SLUG}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hash: hash.toString(),
          comments: [],
        }),
      })
    }
  } catch (err) {
    throw new Error(err)
  }
}
