// Types the site used from @portaljs/core (SiteToc's NavItem/NavGroup and
// Layout's TocSection), kept verbatim.

export interface NavItem {
  name: string;
  href: string;
}

export interface NavGroup {
  name: string;
  path: string;
  level: number;
  children: Array<NavItem | NavGroup>;
}

export interface TocSection {
  id: string;
  title: string;
  level: string;
  children?: any;
}
