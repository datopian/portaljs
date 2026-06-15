import Link from 'next/link'

// White-on-transparent assets are inverted so grayscale doesn't render them
// invisible on the light background.
const WHITE_ASSETS =
  /(sse-logo-white|sigma2-light-transparent|hounslow|UNIOFSY|usyd-dark|mtc-logo|bank-of-england)/i

type Logo = { name: string; src: string; url: string; width?: number; style?: string }

export default function SocialProofStrip({
  heading = 'Trusted by leading organizations worldwide',
  logos,
}: {
  heading?: string
  logos: Logo[]
}) {
  return (
    <div className="text-center max-w-full mx-auto pt-8 pb-24 px-4 sm:px-6 lg:px-8 w-full">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-blue-500">
        {heading}
      </h2>
      <div className="mx-auto mt-10 grid max-w-6xl grid-cols-2 items-center justify-items-center gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
        {logos.map((logo) => (
          <Link
            key={logo.name}
            href={logo.url}
            title={logo.name}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center opacity-90 transition hover:opacity-100"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className={`h-10 w-auto object-contain ${
                logo.style ?? `grayscale${WHITE_ASSETS.test(logo.src) ? ' invert' : ''}`
              }`}
              style={{ maxWidth: logo.width ? `${logo.width}px` : '180px' }}
              src={logo.src}
              alt={`${logo.name} logo`}
              title={logo.name}
              loading="lazy"
            />
          </Link>
        ))}
      </div>
    </div>
  )
}
