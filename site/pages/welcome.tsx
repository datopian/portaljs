import { useEffect } from 'react'
import { useRouter } from 'next/router'
import * as gtag from '@/lib/gtag'
import siteConfig from '@/config/siteConfig'

export default function Welcome() {
  const router = useRouter()

  useEffect(() => {
    // Track the visit to the welcome page
    if (siteConfig.analytics && typeof window.gtag === 'function') {
      gtag.event({
        action: 'welcome_page_visit',
        category: 'Engagement',
        label: 'Cold Email Campaign',
        value: 1,
      })
    }

    // Redirect to home page after tracking
    router.replace('/')
  }, [router])

  return null
}