'use client'
import Heading from '../components/shared/Heading'
import Container from '../components/shared/Container'
import { Button } from '../components/ui/button'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <Container>
      <Heading variant="h1">Something went wrong</Heading>
      <Button onClick={() => reset()}>Try again</Button>
    </Container>
  )
}
