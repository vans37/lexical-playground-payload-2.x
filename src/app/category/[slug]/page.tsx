import React from 'react'
import type { Category, Media } from '../../../payload-types'
import PaginationComponent from '../../../components/pagination'
import ProductCardComponent from '../../../components/products/productCard'
import Container from '../../../components/shared/Container'
import EmptyResults from '../../../components/emptyResults'
import type { Metadata } from 'next'
import qs from 'qs'
import requestApi from '../../../lib/request'
import type { PaginatedDocs } from 'payload/database'
import type { Category as CategoryType } from '../../../payload-types'
import type { Product as ProductType } from '../../../payload-types'
import Wrapper from '../../../components/shared/Wrapper'
import Heading from '../../../components/shared/Heading'

type params = {
  params: {
    slug?: string
  }
  searchParams: {
    page?: string
  }
}

export const dynamic = 'force-dynamic'

export const generateMetadata = async ({ params }: params): Promise<Metadata> => {
  const query = {
    where: {
      slug: {
        equals: params.slug,
      },
    },
  }

  const queryString = qs.stringify(query)
  const url = `/api/categories?${queryString}`

  const categoryMetadataDoc = await requestApi<PaginatedDocs<CategoryType>>(url, {
    cache: 'no-store',
  })

  if (!categoryMetadataDoc || categoryMetadataDoc?.docs?.length === 0) {
    return {}
  }

  const category = categoryMetadataDoc.docs[0]

  const ogImage = category.image as Media
  const imgSrc = `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/${ogImage.filename}`

  return {
    title: category?.meta?.title,
    description: category?.meta?.description,
    keywords: category?.meta?.keywords,
    openGraph: {
      title: category?.meta?.open_graph?.og_title,
      description: category?.meta?.open_graph?.og_description,
      images: imgSrc,
    },
  }
}

export default async function CategorySlugPaginated({ params, searchParams }: params) {
  let currPage: number = 1
  const limit = 8

  if (searchParams && searchParams.page) {
    const searchedPage = parseInt(searchParams.page)
    if (isNaN(searchedPage)) {
      currPage = 1
    } else if (searchedPage > 0) {
      currPage = searchedPage
    }
  }

  const query = {
    collection: 'products',
    limit,
    page: currPage,
    where: {
      ['categories.slug']: {
        contains: params.slug,
      },
    },
  }

  const queryString = qs.stringify(query)

  const productsData = await requestApi<PaginatedDocs<ProductType>>(
    `/api/products?${queryString}`,
    {
      cache: 'no-store',
    },
  )

  if (!productsData || productsData.docs.length === 0) {
    return <EmptyResults />
  }

  const categories = productsData.docs[0].categories as Category[]
  const categoryTitle = categories.filter(v => v.slug === params.slug)[0].title.toLowerCase()

  return (
    <Wrapper>
      <Container>
        <Heading variant='h1'>
          All products in category {categoryTitle}
        </Heading>
        <div className="col-span-3">
          <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
              {productsData.docs.map(product => {
                return (
                  <ProductCardComponent
                    categories={product.categories}
                    images={product.images}
                    slug={product.slug}
                    title={product.title}
                    key={product.id}
                  />
                )
              })}
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-center items-center mb-16">
          <PaginationComponent
            currentPage={currPage}
            itemCount={productsData.totalDocs}
            pageSize={limit}
            url={`/category/${params.slug}?page=`}
          />
        </div>
      </Container>
    </Wrapper>
  )
}
