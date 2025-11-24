import { useTheme } from 'next-themes'
import Image from 'next/image'
import Link from 'next/link'

const logos = [
  {
    name: 'OECD',
    srcDark: '/static/img/social-proof/OECD-grey.png',
    srcLight: '/static/img/social-proof/OECD-light.png',
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
      style: '',
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
      srcLight: '/static/img/social-proof/Marcus_Institute_HMS-light.png',
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
    style: 'grayscale  dark:invert-0 opacity-80',
    width: 200,
  },
] as const

export default function SocialProof() {
  const { resolvedTheme } = useTheme()
  const currentTheme = resolvedTheme ?? 'light'
  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900/40 w-full">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-500">
            Trusted by data leaders worldwide
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Leading governments, enterprises, and research institutions trust PortalJS
          </h2>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {logos.map((logo, index) => (
            <Link
              className="flex items-center justify-center p-4 opacity-75 transition hover:-translate-y-0.5 hover:opacity-100"
              key={logo.srcDark + index}
              title={logo.name}
              href={logo.url}
            >
              <Image
                className={`h-auto ${logo.style}`}
                src={currentTheme === 'light' ? logo.srcLight : logo.srcDark}
                alt={`${logo.name} Logo`}
                title={logo.name}
                height={70}
                width={logo.width}
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
