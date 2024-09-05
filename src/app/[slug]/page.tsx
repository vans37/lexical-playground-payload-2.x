import { notFound } from 'next/navigation'
import React from 'react'
import type { Metadata } from 'next'
import type { Media } from '../../payload-types'
import EmptyResults from '../../components/emptyResults'
import Wrapper from '../../components/shared/Wrapper'
import Container from '../../components/shared/Container'
import renderRichText from '../../components/richText'
import qs from 'qs'
import requestApi from '../../lib/request'
import type { PaginatedDocs } from 'payload/database'
import type { Page as PagesType } from '../../payload-types'

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
  const url = `/api/pages?${queryString}`
  const pageMetadata = await requestApi<PaginatedDocs<PagesType>>(url, {
    next: {
      tags: [`pages_${params.slug}`],
    },
  })

  const page = pageMetadata?.docs[0]

  const ogImage = page?.meta?.open_graph?.og_image as Media
  const imgUrl = `${process.env.NEXT_PUBLIC_PAYLOAD_URL}/${ogImage?.filename}`
  return {
    title: page?.meta?.title,
    description: page?.meta?.description,
    keywords: page?.meta?.keywords,
    openGraph: {
      title: page?.meta?.open_graph?.og_title,
      description: page?.meta?.open_graph?.og_description,
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
  const url = `/api/pages?${queryString}`
  const pageDocs = await requestApi<PaginatedDocs<PagesType>>(url)

  const pageSlugs = pageDocs.docs.map(page => page.slug)

  if (!pageSlugs || pageSlugs.length === 0) {
    return []
  }

  return pageSlugs.map(slug => ({
    slug,
  }))
}

export default async function Page({ params }: params) {
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
  const url = `/api/pages?${queryString}`

  const pageDoc = await requestApi<PaginatedDocs<PagesType>>(url, {
    next: {
      tags: [`pages_${params.slug}`],
    },
  })

  if (!pageDoc || pageDoc?.docs?.length === 0) {
    return <EmptyResults />
  }

  const page = pageDoc.docs[0]

  const content = renderRichText(page?.content?.root)

  return (
    <Wrapper>
      <Container className="my-32 prose lg:prose-lg">{content}</Container>
    </Wrapper>
  )
}
