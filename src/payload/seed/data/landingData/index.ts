import type { LandingPage } from "../../../../payload-types"


const hero = {
  images: [
    {
      alt: 'sneakers',
      src: '/domino-studio-164_6wVEHfI-unsplash.jpg',
    },
    {
      alt: 'camera',
      src: '/eniko-kis-KsLPTsYaqIQ-unsplash.jpg',
    },
    {
      alt: 'glasses',
      src: '/giorgio-trovato-K62u25Jk6vo-unsplash.jpg',
    },
  ],
  subtitle: 'Buy anything you want free of charge, no pun intended',
  title: 'Welcome to our superb store!',
}

const incentives: LandingPage['incentives'] = [
  {
    description: 'Why it is important no one knows',
    svg: 'FaAppleWhole',
    title: 'Super feature',
  },
  {
    description: 'Imagine the world without bugs',
    svg: 'FaBugSlash',
    title: 'Super feature',
  },
  {
    description: 'Your time has come',
    svg: 'FaFire',
    title: 'Super feature',
  },
]

const productData = {
  description: 'Description',
  title: 'Popular products',
}

const meta = {
  description: 'Superb store',
  image: '/giorgio-trovato-K62u25Jk6vo-unsplash.jpg',
  keywords: 'store, ecommerce, nextjs, lexical editor',
  open_graph: {
    og_description: 'Superb stroe',
    og_image: '/giorgio-trovato-K62u25Jk6vo-unsplash.jpg',
    og_site_name: '',
    og_title: 'Superb store',
  },
  robots: 'index',
  title: 'Superb store',
}

const landingData: any = {
  hero,
  incentives,
  meta,
  products: productData,
}

export default landingData
