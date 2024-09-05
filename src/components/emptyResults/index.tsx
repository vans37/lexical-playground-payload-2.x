import Container from '../shared/Container'

const EmptyResults = ({ title = 'Empty results' }: { title?: string }) => {
  return (
    <Container>
      <div className="min-h-screen h-full w-full flex justify-center items-center font-semibold text-lg">
        {title}
      </div>
    </Container>
  )
}

export default EmptyResults
