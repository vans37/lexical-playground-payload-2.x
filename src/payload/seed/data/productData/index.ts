const productData: {
  data: {
    images: {
      filePath: null | string
    }[]
    //seo
    meta: {
      description?: string
      image?: {
        filePath: null | string
      }
      keywords?: string
      open_graph?: {
        og_description?: string
        og_image?: {
          filePath: null | string
        }
        og_site_name?: string
        og_title?: string
        og_type?: 'article' | 'music.song' | 'vide.movie'
      }
      robots: 'follow' | 'index' | 'nofollow' | 'noindex' | 'none'
      title: string
    }
    publishedOn?: null | string
    short_description?: null | string
    status: 'draft' | 'published'
    title: string
  }
} = {
  data: {
    images: [
      {
        filePath: '/c-d-x-PDX_a_82obo-unsplash.jpg',
      },
    ],
    meta: {
      description: 'Product $ description',
      image: {
        filePath: '/c-d-x-PDX_a_82obo-unsplash.jpg',
      },
      keywords: '',
      open_graph: {
        og_description: '',
        og_image: {
          filePath: '/c-d-x-PDX_a_82obo-unsplash.jpg',
        },
        og_site_name: '',
        og_title: 'Product $',
        og_type: 'article',
      },
      robots: 'index',
      title: 'Product $',
    },
    short_description: 'ChatGPT Introducing the UltraTech SmartWatch, the ultimate fusion of style, functionality, and innovation. Designed for the modern, tech-savvy individual, this sleek and lightweight smartwatch offers a premium experience with its stunning 1.5-inch AMOLED display and customizable watch faces. Stay connected on the go with seamless notifications for calls, texts, emails, and social media alerts directly on your wrist.',
    status: 'published',
    title: 'Product $',
  },
}

export default productData
