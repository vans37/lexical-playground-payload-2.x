import Link from 'next/link'
import type { Category, Media, Product } from '../../../payload-types'
import { capitilizeFirstWord } from '../../../lib/utils'
import { WrappedImage } from '../../media'

type ProductCardProps = Pick<Product, 'categories' | 'images' | 'slug' | 'title'>

const ProductCardComponent = ({ slug, categories, images, title }: ProductCardProps) => {
  const firstImage = images[0].image as unknown as Media

  return (
    <div className="group relative">
      <div className=" w-full overflow-hidden rounded-md bg-gray-200  group-hover:opacity-75 h-32 lg:h-72">
        <Link href={`/products/${slug}`}>
          <div className="relative w-full h-full">
            <WrappedImage
              props={{
                resource: firstImage,
                fill: true,
                imgClassName: 'h-full w-full object-cover object-center lg:h-full lg:w-full',
              }}
            />
          </div>
        </Link>
      </div>
      <div className="mt-4 flex justify-between">
        <div>
          <h3 className="text-md text-slate-700">
            <Link href={`/products/${slug}`}>{capitilizeFirstWord(title)}</Link>
          </h3>
          {categories.map((category: Category) => {
            return (
              <Link
                className="mt-4 mr-2 inline-block"
                href={`/category/${category.slug}`}
                key={category.id}
              >
                <span className="text-xs text-gray-500 underline">{category.title}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ProductCardComponent
