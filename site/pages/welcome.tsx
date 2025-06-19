import { useEffect } from 'react'
import { useRouter } from 'next/router'
import * as gtag from '@/lib/gtag'
import siteConfig from '@/config/siteConfig'

export default function Welcome() {
  const router = useRouter()

  useEffect(() => {
    const trackAndRedirect = () => {
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
    }

    // Wait for gtag to be available
    if (siteConfig.analytics) {
      const checkGtag = () => {
        if (typeof window.gtag === 'function') {
          trackAndRedirect()
        } else {
          // Check again after a short delay
          setTimeout(checkGtag, 100)
        }
      }
      checkGtag()
    } else {
      // No analytics configured, just redirect
      router.replace('/')
    }
  }, [router])

  return null
}