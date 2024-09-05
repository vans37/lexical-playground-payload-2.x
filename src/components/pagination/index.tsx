//https://github.com/omunite215/NextJS-Pagination/blob/main/app/components/PaginationComponent.tsx
'use client'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

import { Button } from '../ui/button'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationLink } from '../ui/pagination'

type Props = {
  currentPage: number
  itemCount: number
  pageSize: number
  url: string
}

const PaginationComponent = ({ currentPage, itemCount, pageSize, url }: Props) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const generatePaginationLinks = () => {
    const paginationLinks = []
    const leftEllipsis = currentPage > 2
    const rightEllipsis = currentPage < pageCount - 1

    for (let i = 1; i <= pageCount; i++) {
      if (i === 1 || i === pageCount || (i >= currentPage - 1 && i <= currentPage + 1)) {
        paginationLinks.push(
          <PaginationLink
            href={`${url}${i}`}
            isActive={currentPage === i}
            key={i}
            onClick={() => changePage(i)}
            className="border-indigo-600 hover:bg-indigo-600 hover:text-white"
          >
            {i}
          </PaginationLink>,
        )
      }
    }

    if (leftEllipsis) {
      paginationLinks.splice(1, 0, <PaginationEllipsis key="left" />)
    }
    if (rightEllipsis) {
      paginationLinks.splice(paginationLinks.length - 1, 0, <PaginationEllipsis key="right" />)
    }

    return paginationLinks
  }

  const pageCount = Math.ceil(itemCount / pageSize)
  if (pageCount <= 1) return null

  const changePage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push('?' + params.toString())
  }
  return (
    <Pagination>
      <PaginationContent className=" *:cursor-pointer">
        <Button
          className="group hidden lg:flex text-indigo-600 hover:bg-indigo-600 hover:text-white"
          disabled={currentPage <= 1}
          onClick={() => changePage(currentPage - 1)}
          variant="ghost"
        >
          <ChevronLeft />{' '}Back
        </Button>
        {generatePaginationLinks()}
        <Button
          className="group hidden lg:flex text-indigo-600 hover:bg-indigo-600 hover:text-white"
          disabled={currentPage === pageCount}
          onClick={() => changePage(currentPage + 1)}
          variant="ghost"
        >
          Forward{' '}<ChevronRight />
        </Button>
      </PaginationContent>
    </Pagination>
  )
}

export default PaginationComponent
