import Image from 'next/image'

function getRepositoryLabel(item) {
  if (!item?.repository) {
    return '';
  }
  if (item.name) {
    return `Visit ${item.name} on GitHub`;
  }
  try {
    const pathname = new URL(item.repository).pathname.replace(/\/+$/, '');
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length) {
      return `Visit ${segments[segments.length - 1]} on GitHub`;
    }
  } catch (error) {
    // ignore malformed URLs and fall back below
  }
  return 'Visit repository on GitHub';
}

// Showcase card for /data-portals. Matches the home "Real portals" cards
// (components/home/Showcase.tsx): light card, 16:9 cover image, title + subtitle
// footer, hover lift. The GitHub-repo link (unique to this page) is kept as a
// subtle corner badge.
export default function ShowcasesItem({ item }) {
  const repositoryLabel = getRepositoryLabel(item);
  return (
    <article className="relative group h-full">
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer"
        aria-label={`Visit ${item.title} portal`}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_20px_44px_-24px_rgba(15,23,42,0.35)]"
      >
        <div className="relative aspect-[16/9] overflow-hidden border-b border-slate-200 bg-slate-100">
          <Image
            src={item.image}
            alt={`${item.title} portal`}
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover object-top transition-transform duration-[400ms] group-hover:scale-[1.03]"
          />
        </div>
        <div className="flex items-center justify-between gap-3 px-[18px] py-4">
          <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
          {item.subtitle && (
            <span className="hidden text-right font-mono text-xs font-medium text-slate-400 sm:block">
              {item.subtitle}
            </span>
          )}
        </div>
      </a>
      {item.repository && (
        <a
          target="_blank"
          rel="noreferrer"
          className="absolute top-3 right-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-700 ring-1 ring-slate-200 shadow-sm transition-transform duration-200 hover:scale-110 hover:text-slate-900"
          href={item.repository}
          aria-label={repositoryLabel}
        >
          <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" />
          </svg>
        </a>
      )}
    </article>
  );
}
