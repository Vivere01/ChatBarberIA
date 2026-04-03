import { ThreeElements } from '@react-three/fiber'

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements extends ThreeElements {}
  }
}
