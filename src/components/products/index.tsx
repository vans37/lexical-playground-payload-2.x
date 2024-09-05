'use client'
import Container from '../shared/Container'
import Heading from '../shared/Heading'
import Wrapper from '../shared/Wrapper'
import type { PopularProducts } from '../../app/page'
import ProductCardComponent from './productCard'
import PageLink from '../shared/PageLink'

type ProductProps = {
  props: PopularProducts
}

export default function Products({ props }: ProductProps) {
  const { title, popular_products } = props
  return (
    <Wrapper>
      <Container>
        <div className="flex flex-col justify-center items-center">
          <Heading variant="h2">{title}</Heading>
        </div>

        <div className="col-span-3">
          <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-24 lg:max-w-7xl ">
            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
              {popular_products.map(product => {
                if (product.value.status === 'published') {
                  return (
                    <ProductCardComponent
                      categories={product.value.categories}
                      images={product.value.images}
                      slug={product.value.slug}
                      title={product.value.title}
                      key={product.value.id}
                    />
                  )
                } else {
                  return null
                }
              })}
            </div>
          </div>
        </div>
        <div className="flex flex-row justify-center items-center pt-16">
          <PageLink href="/products" title="All products" />
        </div>
      </Container>
    </Wrapper>
  )
}
