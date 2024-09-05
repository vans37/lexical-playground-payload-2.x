import type { Payload } from "payload"

import { capitilizeFirstWord } from "../../../lib/utils"
import navigationData from "../data/navigationData"

const MAX_DROPDOW_ITEMS = 10

const populateMenu = async (payload: Payload, createdProducts: any[]) => {

  navigationData.links.map(link => {
    if (link.parent_link.label === 'Products') {
      const productIds = createdProducts.map(p => p.id)
      const dropDownLinks = productIds
        .map((pId, index) => {
          if (index < MAX_DROPDOW_ITEMS && MAX_DROPDOW_ITEMS <= createdProducts.length) {
            return {
              link: {
                type: 'reference',
                description: '',
                label: capitilizeFirstWord(createdProducts.filter(p => p.id === pId)[0].title),
                newTab: false,
                reference: {
                  relationTo: 'products',
                  value: pId,
                },
                url: null,
              },
            }
          }
        })
        .filter(Boolean)

      link.dropdown_links = [...dropDownLinks]
    }
  })

  try {
    await payload.updateGlobal({
      slug: 'navigation',
      data: {
        ...navigationData,
      },
    })
  } catch (err) {
    payload.logger.error(err)
  }
}

export default populateMenu