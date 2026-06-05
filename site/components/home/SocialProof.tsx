import Link from 'next/link'

const logos = [
  {
    name: 'OECD',
    srcDark: '/static/img/social-proof/OECD-light.png',
    srcLight: '/static/img/social-proof/OECD-grey.png',
    url: 'https://www.oecd.org/',
    style: 'grayscale opacity-75',
    width: 170,
  },
    {
      name: 'Bank of England',
      srcDark: '/static/img/social-proof/bank-of-england.svg',
      srcLight: '/static/img/social-proof/bank-of-england.svg',
      url: 'https://www.bankofengland.co.uk/',
      style: 'grayscale dark:invert opacity-80',
      width: 200,
    },
    {
      name: 'Transport Data Commons',
      srcDark: '/static/img/social-proof/TDC_logo.svg',
      srcLight: '/static/img/social-proof/TDC_logo.svg',
      url: 'https://portal.transport-data.org/',
      style: 'grayscale dark:invert',
      width: 240,
    },
    {
      name: 'FIND DXConnect',
      srcDark: '/static/img/social-proof/dx-connect-find.svg',
      srcLight: '/static/img/social-proof/dx-connect-find.svg',
      url: 'https://finddx.portaljs.com/',
      style: ' grayscale dark:invert',
      width: 170,
    },
    {
      name: 'Scottish & Southern Electricity Networks',
      srcDark: '/static/img/social-proof/sse-logo-white.png',
      srcLight: '/static/img/social-proof/sse-logo-white.png',
      url: 'https://data.ssen.co.uk/',
      style: 'max-h-28 grayscale invert dark:invert-0 opacity-75',
      width: 200,
    },
    {
      name: 'IDPO (University of Sydney)',
      srcDark: '/static/img/social-proof/UNIOFSY.png',
      srcLight: '/static/img/social-proof/usyd-dark.svg',
      url: 'https://www.idpo.org.au',
      style: 'grayscale',
      width: 115,
    },
    {
      name: 'Sigma2',
      srcDark: '/static/img/social-proof/sigma2-light-transparent.png',
      srcLight: '/static/img/social-proof/sigma2-light-transparent.png',
      url: 'https://archive.sigma2.no/',
      style: 'grayscale ',
      width: 180,
    },
    {
      name: 'UAE Ministry of Energy and Infrastructure',
      srcDark: '/static/img/social-proof/uae_moei_eng-logo.png',
      srcLight: '/static/img/social-proof/uae_moei_eng-logo.png',
      url: 'https://opendata.moei.gov.ae/',
      style: ' grayscale',
      width: 230,
    },
    {
      name: 'Marcus Institute',
      srcDark:
        '/static/img/social-proof/Marcus_Institute_HMS_vertical-grey-transparent.png',
      srcLight: '/static/img/social-proof/Marcus_Institute_HMS_vertical-grey-transparent.png',
      url: 'https://data.hsl.harvard.edu/',
      style: 'grayscale',
      width: 200,
    },
    {
      name: 'Manufacturing Technology Centre',
      srcDark: '/static/img/social-proof/mtc-logo.svg',
      srcLight: '/static/img/social-proof/mtc-logo.svg',
      url: 'https://www.the-mtc.org/',
      style: 'invert dark:invert-0 grayscale opacity-75',
      width: 160,
    },
    {
      name: 'ODNI',
      srcDark: '/static/img/social-proof/Open-Data-Northern-Ireland-grey.png',
      srcLight: '/static/img/social-proof/Open-Data-Northern-Ireland-light.png',
      url: 'https://www.opendatani.gov.uk/',
      style: 'grayscale',
      width: 180,
    },
  {
    name: 'Hounslow',
    srcDark: '/static/img/social-proof/hounslow.svg',
    srcLight: '/static/img/social-proof/hounslow-light.svg',
    url: 'https://data.hounslow.gov.uk',
    style: 'grayscale opacity-80',
    width: 200,
  },
  {
    name: 'City of Ann Arbor',
    srcDark: '/static/img/social-proof/ann-arbor-city.svg',
    srcLight: '/static/img/social-proof/ann-arbor-city.svg',
    url: 'https://www.a2gov.org',
    style: 'grayscale',
    width: 150,
  },
  {
    name: 'Winnipeg Metropolitan Region',
    srcDark: '/static/img/social-proof/winnipeg-metro.svg',
    srcLight: '/static/img/social-proof/winnipeg-metro.svg',
    url: 'https://winnipegmetroregion.ca',
    style: 'grayscale',
    width: 150,
  },
] as const

export default function SocialProof() {
  // Duplicate the row so the marquee can loop seamlessly (translateX -50%
  // lands the second copy exactly where the first began).
  const track = [...logos, ...logos]
  return (
    <section className="w-full bg-slate-50 py-20">
      <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-12">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-500">
            Trusted by data leaders worldwide
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Leading governments, enterprises, and research institutions trust PortalJS
          </h2>
        </div>
      </div>

      {/* Infinite single-line logo carousel. Edges fade out via mask. */}
      <div className="marquee mt-12 w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
        <div className="marquee-track flex w-max items-center gap-16 pr-16">
          {track.map((logo, index) => (
            <Link
              className="flex flex-none items-center justify-center opacity-70 transition hover:opacity-100"
              key={logo.name + index}
              title={logo.name}
              href={logo.url}
              aria-hidden={index >= logos.length ? true : undefined}
              tabIndex={index >= logos.length ? -1 : undefined}
            >
              {/* Plain img: uniform height + width cap, natural aspect, no
                  fixed-width box (next/image's width prop was the source of the
                  oversized logos and the trailing whitespace). */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={`h-8 w-auto max-w-[140px] object-contain ${logo.style}`}
                src={logo.srcLight}
                alt={`${logo.name} logo`}
                title={logo.name}
                loading="lazy"
              />
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .marquee-track {
          animation: marquee-scroll 55s linear infinite;
        }
        .marquee:hover .marquee-track {
          animation-play-state: paused;
        }
        @keyframes marquee-scroll {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track {
            animation: none;
          }
        }
      `}</style>
    </section>
  )
}
