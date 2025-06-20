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
      try {
        gtag.event({
          action: 'get_started_click',
          category: 'Conversion',
          label: 'CTA Button',
          value: 1,
        });
      } catch (error) {
        console.warn('Failed to track conversion event:', error);
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
