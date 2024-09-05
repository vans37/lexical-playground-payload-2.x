'use client'

import Container from '../shared/Container'
import Heading from '../shared/Heading'
import Wrapper from '../shared/Wrapper'

import type { PopularCategories } from '../../app/page'

import CategoryCard from './categoryCard'
import PageLink from '../shared/PageLink'

type CategoriesProps = {
  props: PopularCategories
}

export default function Categories({ props }: CategoriesProps) {
  return (
    <Wrapper className="my-36 py-16">
      <Container>
        <div className="flex flex-col justify-center items-center">
          <Heading variant="h2">Categories</Heading>
        </div>

        <div className="col-span-3">
          <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-24 lg:max-w-7xl ">
            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-6 xl:gap-x-8">
              {props.categories.map(category => {
                return (
                  <CategoryCard
                    image={category.value.image}
                    slug={category.value.slug}
                    title={category.value.title}
                    key={category.value.id}
                  />
                )
              })}
            </div>
          </div>
        </div>
        <div className="flex justify-center items-center">
          <PageLink title="All categories" href="category/" />
        </div>
      </Container>
    </Wrapper>
  )
}
