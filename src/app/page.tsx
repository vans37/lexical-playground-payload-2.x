import type { Category, LandingPage, Media, Product } from '../payload-types'
import Categories from '../components/categories'
import Incentive from '../components/landing/incentive'
import Products from '../components/products'
import Hero from '../components/landing/hero'
import type { Metadata } from 'next'
import requestApi from '../lib/request'
import { notFound } from 'next/navigation'
import React from 'react'

type RelatedProduct = {
  relationTo: string
  value: Pick<Product, 'categories' | 'images' | 'slug' | 'title' | 'status' | 'id'>
}

export type PopularProducts = {
  title: string
  description: string
  popular_products: RelatedProduct[]
}

type RelatedCategory = {
  relationTo: string
  value: Category
}

export type PopularCategories = {
  categories: RelatedCategory[]
}

export const dynamic = 'force-static'

export const generateMetadata = async (): Promise<Metadata> => {
  const landingPageMeta = await requestApi<LandingPage>('/api/globals/landing_page', {
    next: {
      tags: ['landing_page'],
    },
  })

  if (!landingPageMeta) {
    return
  }

  const ogImage = landingPageMeta?.meta?.open_graph?.og_image as Media
  const imgUrl = `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/${ogImage?.filename}`
  return {
    title: landingPageMeta?.meta?.title,
    description: landingPageMeta?.meta?.description,
    keywords: landingPageMeta?.meta?.keywords,
    openGraph: {
      title: landingPageMeta?.meta?.open_graph?.og_title,
      description: landingPageMeta?.meta?.open_graph?.og_description,
      images: imgUrl,
    },
  }
}

export default async function Home() {
  const landingPageData = await requestApi<LandingPage>('/api/globals/landing_page', {
    next: {
      tags: ['landing_page'],
    },
  })

  if (!landingPageData) {
    return notFound()
  }

  const { hero, incentives, products, categories } = landingPageData

  const relatedProducts = products.popular_products.map(p => {
    const value = p.value as Product

    return {
      relationTo: p.relationTo,
      value: {
        id: value.id,
        slug: value.slug,
        categories: value.categories,
        status: value.status,
        images: value.images,
        title: value.title,
      },
    } as RelatedProduct
  })

  const popularProducts: PopularProducts = {
    title: products.title,
    description: products.description,
    popular_products: relatedProducts,
  }

  return (
    <React.Fragment>
      <Hero images={hero.images} subtitle={hero.subtitle} title={hero.title} />
      <Incentive incentives={incentives} />
      <Products props={popularProducts} />
      <Categories props={categories as PopularCategories} />
    </React.Fragment>
  )
}
