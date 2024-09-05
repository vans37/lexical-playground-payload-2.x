import React, { Suspense } from 'react'
import PaginationComponent from '../../components/pagination'
import ProductCardComponent from '../../components/products/productCard'
import Container from '../../components/shared/Container'
import EmptyResults from '../../components/emptyResults'
import Wrapper from '../../components/shared/Wrapper'
import type { Metadata } from 'next'
import requestApi from '../../lib/request'
import type { Product as ProductType } from '../../payload-types'
import type { PaginatedDocs } from 'payload/database'
import qs from 'qs'
import Heading from '../../components/shared/Heading'

export const dynamic = 'force-dynamic'

type SearchParams = {
  searchParams: {
    page?: string
  }
}

export const generateMetadata = async ({ searchParams }: SearchParams): Promise<Metadata> => {
  if (searchParams && searchParams.page) {
    const page = parseInt(searchParams.page)

    if (!isNaN(page) && page > 0) {
      return {
        title: `All products page - ${page}`,
      }
    }
  }

  return {
    title: 'All products',
  }
}

export default async function ProductsPaginated({ searchParams }: SearchParams) {
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
    limit,
    page: currPage,
    sort: '-createdAt',
    where: {
      status: {
        equals: 'published',
      },
    },
  }

  const queryString = qs.stringify(query)

  const products = await requestApi<PaginatedDocs<ProductType>>(`/api/products?${queryString}`, {
    cache: 'no-store',
  })

  if (!products || products.docs.length === 0) {
    return <EmptyResults />
  }

  return (
    <Wrapper>
      <Container>
        <Heading variant="h1">All products</Heading>
        <div className="bg-white col-span-3">
          <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
              {products.docs.map(product => {
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
          <Suspense>
            <PaginationComponent
              currentPage={currPage}
              itemCount={products.totalDocs}
              pageSize={limit}
              url="/products?page="
            />
          </Suspense>
        </div>
      </Container>
    </Wrapper>
  )
}
