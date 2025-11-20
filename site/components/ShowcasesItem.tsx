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

export default function ShowcasesItem({ item }) {
  const repositoryLabel = getRepositoryLabel(item);
  return (
    <article className="relative group h-full">
      <a
        href={item.href}
        target="_blank"
        rel="noreferrer"
        aria-label={`Visit ${item.title} portal`}
        className="block h-full overflow-hidden rounded-2xl ring-1 ring-white/15 bg-slate-950/40 transition-shadow duration-300 hover:ring-primary"
      >
        <div className="relative w-full overflow-hidden aspect-[16/9]">
          <img
            src={item.image}
            alt={item.title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
        <div className="flex h-full flex-col gap-3 p-4 text-white">
          <div className="text-xs uppercase tracking-wide text-white/70">
            {item.subtitle}
          </div>
          <div className="space-y-1">
            <p className="text-xl font-semibold">{item.title}</p>
            <p className="text-sm text-white/80">{item.description}</p>
          </div>
          <div className="mt-auto inline-flex items-center text-sm font-semibold text-primary">
            Visit portal
            <svg
              className="ml-2 h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </div>
        </div>
      </a>
      {item.repository && (
        <a
          target="_blank"
          rel="noreferrer"
          className="absolute top-3 right-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/80 text-white transition-transform duration-200 hover:scale-110"
          href={item.repository}
          aria-label={repositoryLabel}
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z" />
          </svg>
        </a>
      )}
    </article>
  );
}
