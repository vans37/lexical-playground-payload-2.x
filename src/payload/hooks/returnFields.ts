import { getProperty, setProperty } from '../utilities/dotProp'

/* 
  *Return only selected values from relational field
*/

const getRelationalDocAndFilter = async (doc: any, fields: string[], req: any): Promise<any> => {
  const relatedDocument: { relationTo: any; value: any } = { ...doc }
  const { relationTo, value } = relatedDocument
  const { payload } = req

  if (!value || !relationTo) {
    throw new Error()
  }

  const itemData = await payload.findByID({
    id: value,
    collection: relationTo,
  })

  if (!itemData) {
    throw new Error(`Item ${relationTo} with ID ${value} does not exist`)
  }

  const obj: Record<string, any> = {}
  let shouldSetProperty = false

  fields.forEach(field => {
    if (field in itemData) {
      obj[field] = itemData[field]
      shouldSetProperty = true
    }
  })

  if (shouldSetProperty) {
    return {
      relationTo,
      value: {
        ...obj,
      },
    }
  }

  return doc
}

const filterRelationalFields = async (
  obj: Record<string, any>,
  path: string,
  fields: string[],
  req: any,
): Promise<Record<string, any>> => {
  const pathParts = path.split('.')
  const firstProp = pathParts[0]

  if (!obj || !obj[firstProp]) {
    return obj
  }

  if (pathParts.length === 1) {
    const nestedObj = getProperty(obj, firstProp, null) as []

    if (nestedObj && Array.isArray(nestedObj)) {
      const updatedArray = await Promise.all(
        nestedObj.map(async (item: any, index: number) => {
          const relationalDoc = await getRelationalDocAndFilter(item, fields, req)
          return relationalDoc
        }),
      )
      return setProperty({ ...obj }, firstProp, updatedArray)
    } else if (typeof nestedObj === 'object') {
      const updatedNested = await getRelationalDocAndFilter(nestedObj, fields, req)
      return setProperty({ ...obj }, firstProp, updatedNested)
    } else {
      return { ...obj }
    }
  } else {
    const restOfPath = pathParts.slice(1).join('.')
    const currentValue = getProperty(obj, firstProp, {}) as unknown

    if (currentValue && Array.isArray(currentValue)) {
      const updatedArray = await Promise.all(
        currentValue.map(async (item: Record<string, any>) => {
          const updatedItem = await filterRelationalFields(item, restOfPath, fields, req)
          return updatedItem
        }),
      )

      return setProperty({ ...obj }, firstProp, updatedArray)
    } else if (typeof currentValue === 'object') {
      const updatedNested = await filterRelationalFields(currentValue, restOfPath, fields, req)
      return setProperty({ ...obj }, firstProp, updatedNested)
    } else {
      return { ...obj }
    }
  }
}

export default filterRelationalFields
