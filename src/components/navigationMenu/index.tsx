'use client'

import Link from 'next/link'
import * as React from 'react'
import type {  Navigation, Product } from '../../payload-types'

import { cn } from '../../lib/utils'
import Container from '../shared/Container'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '../ui/navigation-menu'
import useSticky from '../../hooks/useSticky'
import MobileNav from './mobile'
import { FormDialogContext } from '../../context/form'
import { Button } from '../ui/button'

export type NavProps = {
  navData: Navigation
}

export type Link = {
  parent_link: {
    url: string
    label: string
  }
  dropdown_links?: DropDownLink[]
}

export type DropDownLink = {
  link: {
    type?: 'reference' | 'custom'
    newTab?: boolean
    reference?:
      | {
          relationTo: 'products'
          value: number | Product
        }
    url?: string
    label: string
    description?: string
  }
  id?: string
}

// export const constructRelationalUrl = (dropDownLink: DropDownLink, parentLink: Link) => {
//   let url = '/'
//   if (dropDownLink.link.type === 'reference' && dropDownLink?.link?.reference?.value) {
//     const relationalItem = dropDownLink.link.reference.value as Product
//     const slug = relationalItem.slug ?? '/'
//     url = '/' + parentLink.parent_link.url + '/' + slug
//   } else if (dropDownLink.link.type === 'custom') {
//     url = dropDownLink.link.url
//   }

//   return url
// }

export const constructRelationalUrl = (dropDownLink: DropDownLink, parentLink: Link) => {
  let url = process.env.NEXT_PUBLIC_PAYLOAD_URL + '/'
  if (dropDownLink.link.type === 'reference' && dropDownLink?.link?.reference?.value) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-redundant-type-constituents
    const relationalItem = dropDownLink.link.reference.value as Product
    const slug = relationalItem.slug ?? '/'
    url += parentLink.parent_link.url + '/' + slug
  } else if (dropDownLink.link.type === 'custom') {
    url = dropDownLink.link.url
  }
 
  return url
}

export function NavMenu({ navData }: NavProps) {
  const { stickyRef, sticky } = useSticky()

  const { setOpen } = React.useContext(FormDialogContext)

  if (!navData) {
    return null
  }

  if (navData.links.length > 0) {
    return (
      <div ref={stickyRef} className={cn('w-full border-2 bg-white z-[2] py-2', sticky && 'fixed')}>
        <Container className="flex flex-row justify-end py-2">
          <MobileNav navData={navData} />
          <NavigationMenu className="hidden lg:flex w-full ">
            <div className="w-full">
              <div className="flex flex-row justify-between">
                <div className={cn('list-none invisible', sticky && 'block visible')}>
                  <div className="flex flex-row justify-between items-center">
                    {/* Order button */}
                    <div className="ml-4">
                      <Button className="bg-indigo-600" onClick={() => setOpen(true)}>
                        Contact us
                      </Button>
                    </div>
                  </div>
                </div>

                <NavigationMenuList className="flex flex-row items-center list-none">
                  {navData.links.map(link => {
                    if (link.dropdown_links.length > 0) {
                      return (
                        <NavigationMenuItem key={link.id}>
                          <NavigationMenuTrigger>
                            <Link href={'/' + link.parent_link.url}>{link.parent_link.label}</Link>
                          </NavigationMenuTrigger>
                          <NavigationMenuContent className="right:0 absolute left-auto top-full w-auto">
                            <ul className="p-4 flex flex-col min-w-64">
                              {link.dropdown_links.map(dropDownLink => {
                                const url = constructRelationalUrl(dropDownLink, link)
                                return (
                                  <li className="w-full" key={link.id}>
                                    <Link
                                      className="before:content-['\2022'] before:w-2 before:h-2 before:pr-1 before:text-indigo-600 before:rounded-full  block bg-gray-50 text-sm leading-5 select-none my-1 rounded-md p-3 no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                      href={url}
                                    >
                                      {dropDownLink.link.label}
                                    </Link>
                                  </li>
                                )
                              })}
                            </ul>
                          </NavigationMenuContent>
                        </NavigationMenuItem>
                      )
                    } else if (link.dropdown_links.length === 0) {
                      return (
                        <NavigationMenuItem key={link.id}>
                          <Link
                            className={navigationMenuTriggerStyle()}
                            href={link.parent_link.url}
                          >
                            {link.parent_link.label}
                          </Link>
                        </NavigationMenuItem>
                      )
                    } else {
                      return null
                    }
                  })}
                </NavigationMenuList>
              </div>
            </div>
          </NavigationMenu>
        </Container>
      </div>
    )
  } else {
    return null
  }
}
