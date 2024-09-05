import Link from 'next/link'

import type { Category, Media } from '../../../payload-types'
import { WrappedImage } from '../../media'

type CategoryCardProps = Pick<Category, 'image' | 'slug' | 'title'>

const CategoryCard = ({ slug, image, title }: CategoryCardProps) => {
  const img = image as Media

  return (
    <div className="group relative">
      <div className="relative  w-full overflow-hidden rounded-md bg-gray-200 group-hover:opacity-75 h-32">
        <WrappedImage
          props={{
            imgClassName: 'h-full w-full object-cover object-center lg:h-full lg:w-full',
            fill: true,
            resource: img,
          }}
        />
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-sm text-gray-700">
            <Link href={`/category/${slug}`}>
              <span aria-hidden="true" className="absolute inset-0" />
              {title}
            </Link>
          </h3>
        </div>
      </div>
    </div>
  )
}

export default CategoryCard
