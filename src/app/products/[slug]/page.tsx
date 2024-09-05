import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'
import type { Category, Media } from '../../../payload-types'
import Container from '../../../components/shared/Container'
import Heading from '../../../components/shared/Heading'
import { Separator } from '../../../components/ui/separator'
import type { ProductImagesProps } from '../../../components/products/productOverview/imageGallery'
import ProductImages from '../../../components/products/productOverview/imageGallery'
import ProductDescription from '../../../components/products/productOverview/description'
import EmptyResults from '../../../components/emptyResults'
import HeroButton from '../../../components/landing/hero/button'
import renderRichText from '../../../components/richText'
import type { Metadata } from 'next'
import qs from 'qs'
import requestApi from '../../../lib/request'
import type { PaginatedDocs } from 'payload/database'
import type { Product as ProductType } from '../../../payload-types'

type params = {
  params: {
    slug?: string
  }
}

export const dynamic = 'force-static'
export const dynamicParams = true

export const generateMetadata = async ({ params }: params): Promise<Metadata> => {
  const query = {
    where: {
      slug: {
        equals: params.slug,
      },
    },
  }

  const queryString = qs.stringify(query)
  const url = `/api/products?${queryString}`
  const productMetaData = await requestApi<PaginatedDocs<ProductType>>(url, {
    next: {
      tags: [`products_${params.slug}`],
    },
  })

  if (!productMetaData || productMetaData?.docs?.length === 0) {
    return
  }

  const item = productMetaData.docs[0]

  const ogImage = item?.meta?.open_graph?.og_image as Media
  const imgUrl = `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/${ogImage?.filename}`
  return {
    title: item?.meta?.title,
    description: item?.meta?.description,
    keywords: item?.meta?.keywords,
    openGraph: {
      title: item?.meta?.open_graph?.og_title,
      description: item?.meta?.open_graph?.og_description,
      images: imgUrl,
    },
  }
}

const STATIC_GEN_LIMIT = 100

export async function generateStaticParams() {
  const query = {
    limit: STATIC_GEN_LIMIT,
  }

  const queryString = qs.stringify(query)
  const url = `/api/products?${queryString}`
  const products = await requestApi<PaginatedDocs<ProductType>>(url)

  const productSlugs = products.docs.map(product => product.slug)

  if (!productSlugs || productSlugs.length === 0) {
    return []
  }

  return productSlugs.map(slug => ({
    slug,
  }))
}

export default async function ProductPage({ params }: params) {
  if (!params.slug) {
    return notFound()
  }

  const query = {
    where: {
      slug: {
        equals: params.slug,
      },
    },
  }
  const queryString = qs.stringify(query)
  const url = `/api/products?${queryString}`

  const productData = await requestApi<PaginatedDocs<ProductType>>(url, {
    next: {
      tags: [`products_${params.slug}`],
    },
  })

  if (!productData || productData?.docs?.length === 0) {
    return <EmptyResults />
  }

  const product = productData.docs[0]

  const productDescription = renderRichText(product?.description?.root)

  return (
    <Container className="py-32">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="max-w-2xl w-full overflow-hidden">
          <ProductImages images={product.images as ProductImagesProps} />
        </div>
        <div className="max-w-xl overflow-hidden w-full px-4 py-8">
          <div className="flex flex-col mx-auto mt-6">
            <div className="product-title mb-8">
              <Heading variant="h1">{product.title}</Heading>
            </div>
            <div className="product-short-description mb-2">
              <p className="text-slate-600 text-md ">{product?.short_description}</p>
            </div>
            <div className="order-btn mb-2">
              <HeroButton className="w-full rounded-lg uppercase font-semibold" title="Buy" />
            </div>
            {product?.categories?.length > 0 && (
              <React.Fragment>
                <Separator />
                <div className="categories flex flex-col mt-8">
                  <div className="text-slate-800 text-sm">
                    {product.categories.length === 1 && <p>Category</p>}
                    {product.categories.length > 1 && <p>Categories</p>}
                  </div>

                  <div className="flex flex-row flex-wrap">
                    {product.categories.map((category: Category) => {
                      return (
                        <Link
                          className="text-sm text-slate-500 p-2 underline lowercase"
                          href={`/category/${category.slug}`}
                          key={category.id}
                        >
                          {category.title}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </React.Fragment>
            )}
          </div>
        </div>
      </div>
      {product?.description && (
        <React.Fragment>
          <Separator className="mt-16" />
          <ProductDescription
            className="my-8"
            description={productDescription}
            descriptionHtml={product.description_html}
            title="Description"
          />
        </React.Fragment>
      )}
    </Container>
  )
}
