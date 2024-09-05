import { usePathname, useSearchParams } from 'next/navigation'
import { Sheet, SheetContent, SheetTrigger } from '../../ui/sheet'
import { ChevronDown, MenuIcon, ExternalLink } from 'lucide-react'
import { Button } from '../../ui/button'
import type { NavProps } from '..'
import { constructRelationalUrl } from '..'
import { useEffect, useRef, useState } from 'react'
import React from 'react'
import Link from 'next/link'
import { cn } from '../../../lib/utils'

const MobileNav = ({ navData }: NavProps) => {
  const [openDropDowns, setOpenDropDowns] = useState<{ [key: string]: boolean }>({})
  const [sheetOpen, setSheetOpen] = useState(false)

  const pathname = usePathname()
  const searchParams = useSearchParams()

  const fullRoutePath = useRef(pathname + searchParams.toString())

  useEffect(() => {
    const currRoutePath = pathname + searchParams.toString()
    if (currRoutePath !== fullRoutePath.current) {
      fullRoutePath.current = currRoutePath
      setSheetOpen(false)
    }
  }, [pathname, searchParams])

  const toggleDropDown = (id: string) => {
    setOpenDropDowns(prev => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <Sheet open={sheetOpen} onOpenChange={() => setSheetOpen(prev => !prev)}>
      <div className="w-full flex lg:hidden flex-row justify-between items-center ">
        <SheetTrigger asChild>
          <Button className="lg:hidden" size="icon" variant="outline">
            <MenuIcon className="h-6 w-6" />
            <span className="sr-only">Open nav</span>
          </Button>
        </SheetTrigger>
      </div>

      <SheetContent side="left">
        <React.Fragment>
          {navData.links.map(link => {
            const isOpen = !!openDropDowns[link.id]
            if (link.dropdown_links.length > 0) {
              return (
                <div className="overflow-auto max-h-96" key={link.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    className="flex w-full justify-between items-center py-2 text-lg"
                    onClick={() => toggleDropDown(link.id)}
                    onKeyDown={e => {
                      if (e.key == 'Enter') {
                        toggleDropDown(link.id)
                      }
                    }}
                  >
                    <div className="flex flex-row items-center">
                      {link.parent_link.label}
                      <Link href={`${process.env.NEXT_PUBLIC_PAYLOAD_URL}/${link.parent_link.url}`}>
                        <ExternalLink size={16} className="ml-4" />
                      </Link>
                    </div>
                    <ChevronDown className={cn(isOpen ? 'rotate-180' : 'rotate-0', 'mr-2')} />
                  </div>
                  {isOpen && (
                    <div className="flex flex-col ">
                      {link.dropdown_links.map(dropDownLink => {
                        const url = constructRelationalUrl(dropDownLink, link)
                        return (
                          <Link
                            href={url}
                            className="before:content-['\2022'] before:w-2 before:h-2 before:pr-1 before:text-indigo-600 before:rounded-full text-sm block p-2 bg-gray-50 my-2"
                            key={dropDownLink.id}
                          >
                            {dropDownLink.link.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            } else {
              return (
                <Link
                  className="flex w-full items-center py-2 text-lg"
                  href={`${process.env.NEXT_PUBLIC_PAYLOAD_URL}/${link.parent_link.url}`}
                  key={link.id}
                >
                  {link.parent_link.label}
                </Link>
              )
            }
          })}
        </React.Fragment>
      </SheetContent>
    </Sheet>
  )
}

export default MobileNav
