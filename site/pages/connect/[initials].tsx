import { useEffect } from 'react'
import { useRouter } from 'next/router'
import * as gtag from '@/lib/gtag'
import siteConfig from '@/config/siteConfig'

export default function ConnectCampaignPage() {
  const router = useRouter()
  const { initials } = router.query

  useEffect(() => {
    if (typeof initials === 'string') {
      const trackAndRedirect = () => {
        // Track the visit to the connect page
        if (siteConfig.analytics && typeof window.gtag === 'function') {
          // Store acquisition source and person initials in sessionStorage for later use
          sessionStorage.setItem('acquisition_source', 'linkedin_connect')
          sessionStorage.setItem('campaign_person', initials)

          // Set custom user property for LinkedIn connect acquisition
          window.gtag('set', {
            acquisition_source: 'linkedin_connect',
            campaign_person: initials
          })

          gtag.event({
            action: 'connect_page_visit',
            category: 'Engagement',
            label: `LinkedIn Connect Campaign - ${initials.toUpperCase()}`,
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
    }
  }, [router, initials])

  return null
}