import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Navbar from '../components/Navbar'

export default function App({ Component, pageProps }: AppProps) {
  // Navbar renders on every page (home, search, and each dataset showcase).
  return (
    <>
      <Navbar />
      <Component {...pageProps} />
    </>
  )
}
