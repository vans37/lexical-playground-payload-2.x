import Link from 'next/link'
import Container from '../components/shared/Container'
import Heading from '../components/shared/Heading'

export default function NotFound() {
  return (
    <Container className="my-10 flex flex-col justify-center items-center">
      <Heading variant="h1">404</Heading>
      <p className="text-lg mb-4">Not found</p>
      <Link className="bg-indigo-600 text-white rounded-lg px-4 py-2" href="/">
        Back home
      </Link>
    </Container>
  )
}
