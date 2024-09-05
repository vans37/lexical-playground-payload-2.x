import type { Access, FieldAccess } from 'payload/types'

import type { User } from '../../payload-types'

export const isAdminOrEditor: Access<any, User> = ({ req: { user } }) => {
  return Boolean(user?.roles?.includes('admin') || user?.roles?.includes('editor'))
}

export const isAdminOrEditorFieldLevel: FieldAccess<{ id: string }, unknown, User> = ({
  req: { user },
}) => {
  return Boolean(user?.roles?.includes('admin') || user?.roles?.includes('editor'))
}
