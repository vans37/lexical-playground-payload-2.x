import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Footer from '../components/footer'
import { NavMenu } from '../components/navigationMenu'
import FormDialogContextProvider from '../context/form'
import './globals.css'
import { Suspense } from 'react'
import requestApi from '../lib/request'
import type { Navigation } from '../payload-types'
import DialogForm from '../components/form/ModalForm'
import { Toaster } from '../components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Lexical test',
  description: 'Test basic lexical features',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const navData = await requestApi<Navigation>('/api/globals/navigation', {
    next: {
      tags: ['navigation'],
    },
  })

  return (
    <html lang="en">
      <body className={inter.className}>
        <FormDialogContextProvider>
          <Suspense>
            <NavMenu navData={navData} />
          </Suspense>
          <main>{children}</main>
          <DialogForm />
          <Footer />
          <Toaster />
        </FormDialogContextProvider>
      </body>
    </html>
  )
}
