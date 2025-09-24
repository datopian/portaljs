import { AnchorHTMLAttributes } from "react";
import * as gtag from '@/lib/gtag';
import siteConfig from '@/config/siteConfig';

type ButtonLinkProps = {
  style?: "primary" | "secondary" | "tertiary";
  children: string;
  className?: string;
  title?: string;
  href?: string;
  trackConversion?: boolean;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "style">;

export default function ButtonLink({
  style = "primary",
  children,
  className = "",
  href = "https://cloud.portaljs.com/",
  title = "Get started with PortalJS Cloud",
  trackConversion = false,
  onClick,
  ...rest
}: ButtonLinkProps) {
  let _className: string =
    "inline-block items-center justify-center px-4 py-2 border text-base font-semibold text-center rounded transition duration-300 ";

  if (style == "primary") {
    _className += `border-transparent bg-secondary hover:bg-secondary-hover text-black`;
  } else if (style == "secondary") {
    _className += `border-secondary hover:bg-secondary-hover hover:text-black text-secondary`;
  } else if (style == "tertiary") {
    _className += `border-none hover:bg-slate-700 text-slate-300 bg-slate-800 `;
  }


  _className += ` ${className}`;

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Execute parent onClick handler first if provided
    if (onClick) {
      onClick(event);
    }

    // Track conversion if enabled
    if (trackConversion && siteConfig.analytics && typeof window.gtag === 'function') {
      event.preventDefault(); // Prevent immediate navigation
      
      try {
        const eventData: any = {
          action: 'get_started_click',
          category: 'Conversion',
          label: 'CTA Button',
          value: 1,
        };

        // Only add acquisition_source if it exists (cold email visitors)
        const acquisitionSource = typeof window !== 'undefined' 
          ? sessionStorage.getItem('acquisition_source')
          : null;
        
        if (acquisitionSource) {
          eventData.acquisition_source = acquisitionSource;
        }

        // Add campaign person if it exists (LinkedIn connect campaigns)
        const campaignPerson = typeof window !== 'undefined' 
          ? sessionStorage.getItem('campaign_person')
          : null;
        
        if (campaignPerson) {
          eventData.campaign_person = campaignPerson;
        }

        // Use event_callback to ensure navigation happens after tracking
        window.gtag('event', eventData.action, {
          event_category: eventData.category,
          event_label: eventData.label,
          value: eventData.value,
          acquisition_source: eventData.acquisition_source,
          campaign_person: eventData.campaign_person,
          event_callback: () => {
            window.location.href = href || 'https://cloud.portaljs.com/';
          }
        });

        // Fallback timeout in case gtag callback doesn't fire
        setTimeout(() => {
          window.location.href = href || 'https://cloud.portaljs.com/';
        }, 200);

      } catch (error) {
        console.warn('Failed to track conversion event:', error);
        // Navigate anyway if tracking fails
        window.location.href = href || 'https://cloud.portaljs.com/';
      }
    }
  };

  return (
    <a
      href={href}
      title={title}
      className={_className}
      {...rest}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
