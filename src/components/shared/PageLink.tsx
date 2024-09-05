import Link from 'next/link'
import DynamicIcon from '../dynamicIcon'

export default function PageLink({ title, href }: { title: string; href: string }) {
  return (
    <Link
      href={href}
      className=" rounded-md px-6 py-2 text-indigo-600 flex flex-row justify-center items-center hover:underline underline-offset-4"
    >
      {title}
      <DynamicIcon icon="FaArrowRightLong" className="ml-2" />
    </Link>
  )
}
