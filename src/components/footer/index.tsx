import { WrappedImage } from '../media'
import Container from '../shared/Container'
import { Separator } from '../ui/separator'

export default function Footer() {
  return (
    <Container>
      <Separator />
      <div className="flex flex-col lg:flex-row justify-between items-center  py-8">
        <div className="max-w-64 text-xs">© {new Date().getFullYear()}</div>
        <div className="w-16 h-16 relative">
          <WrappedImage props={{ alt: 'Superb logotype', fill: true, src: '/logo.png' }} />
        </div>
      </div>
    </Container>
  )
}
