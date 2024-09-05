import React, { Suspense } from 'react'
import CategoryCard from '../../components/categories/categoryCard'
import PaginationComponent from '../../components/pagination'
import Container from '../../components/shared/Container'
import EmptyResults from '../../components/emptyResults'
import Wrapper from '../../components/shared/Wrapper'
import type { Metadata } from 'next'
import qs from 'qs'
import requestApi from '../../lib/request'
import type { PaginatedDocs } from 'payload/database'
import type { Category as CategoryType } from '../../payload-types'
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
        title: `All categories page - ${page}`,
      }
    }
  }

  return {
    title: 'All categories',
  }
}

export default async function CategoriesPaginated({ searchParams }: SearchParams) {
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
  }

  const queryString = qs.stringify(query)
  const categories = await requestApi<PaginatedDocs<CategoryType>>(
    `/api/categories?${queryString}`,
    {
      cache: 'no-store',
    },
  )
  if (!categories || categories.docs.length === 0) {
    return <EmptyResults />
  }

  return (
    <Wrapper>
      <Container>
        <Heading variant='h1'>All categories</Heading>
        <div className="col-span-3">
          <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
              {categories.docs.map(category => {
                return (
                  <CategoryCard
                    image={category.image}
                    slug={category.slug}
                    title={category.title}
                    key={category.id}
                  />
                )
              })}
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-center items-center mb-16">
            <PaginationComponent
              currentPage={currPage}
              itemCount={categories.totalDocs}
              pageSize={limit}
              url="/category?page="
            />
        </div>
      </Container>
    </Wrapper>
  )
}
