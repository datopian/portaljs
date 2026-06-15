import { useTheme } from 'next-themes'
import Image from 'next/image'
import Link from 'next/link'

export default function SocialProof() {
  const logos = [
    {
      name: 'Transport Data Commons',
      srcDark: '/static/img/social-proof/TDC_logo.svg',
      srcLight: '/static/img/social-proof/TDC_logo.svg',
      url: 'https://portal.transport-data.org/',
      style: 'grayscale',
      width: 240,
    },
    {
      name: 'FIND DXConnect',
      srcDark: '/static/img/social-proof/dx-connect-find.svg',
      srcLight: '/static/img/social-proof/dx-connect-find.svg',
      url: 'https://finddx.portaljs.com/',
      style: 'grayscale',
      width: 170,
    },
    {
      name: 'Scottish & Southern Electricity Networks',
      srcDark: '/static/img/social-proof/sse-logo-white.png',
      srcLight: '/static/img/social-proof/sse-logo-white.png',
      url: 'https://data.ssen.co.uk/',
      style: 'max-h-28 invert',
      width: 200,
    },
    {
      name: 'IDPO (University of Sydney)',
      srcDark: '/static/img/social-proof/UNIOFSY.png',
      srcLight: '/static/img/social-proof/usyd-dark.svg',
      url: 'https://www.idpo.org.au',
      style: 'grayscale invert',
      width: 115,
    },
    {
      name: 'UAE Ministry of Energy and Infrastructure',
      srcDark: '/static/img/social-proof/uae_moei_eng-logo.png',
      srcLight: '/static/img/social-proof/uae_moei_eng-logo.png',
      url: 'https://opendata.moei.gov.ae/',
      style: 'grayscale brightness-75',
      width: 230,
    },
    {
      name: 'Marcus Institute',
      srcDark:
        '/static/img/social-proof/Marcus_Institute_HMS_vertical-grey-transparent.png',
      srcLight: '/static/img/social-proof/Marcus_Institute_HMS-light.png',
      url: 'https://data.hsl.harvard.edu/',
      style: 'brightness-0',
      width: 200,
    },
    {
      name: 'ODNI',
      srcDark: '/static/img/social-proof/Open-Data-Northern-Ireland-grey.png',
      srcLight: '/static/img/social-proof/Open-Data-Northern-Ireland-light.png',
      url: 'https://www.opendatani.gov.uk/',
      style: 'grayscale contrast-200 brightness-50',
      width: 180,
    },
    {
      name: 'Hounslow',
      srcDark: '/static/img/social-proof/hounslow.svg',
      srcLight: '/static/img/social-proof/hounslow-light.svg',
      url: 'https://data.hounslow.gov.uk',
      style: 'grayscale invert',
      width: 200,
    },
  ]

  const { theme, setTheme } = useTheme()
  return (
    <div className="text-center max-w-full mx-auto py-24 px-4 sm:px-6 lg:px-8 w-full ">
      <h2 className="text-base font-semibold text-blue-500 uppercase tracking-wide opacity-75">
        Highlights of PortalJS & CKAN implementations
      </h2>
      <div className="max-w-8xl flex justify-center mt-5" tabIndex={0}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 justify-center items-center gap-x-4 gap-y-5 w-full mt-6">
          {logos.map((logo, index) => (
            <Link
              className="flex items-center justify-center w-full h-full max-h-24 p-2 opacity-90 hover:opacity-100 transition-all duration-300"
              key={logo.srcDark + index}
              title={logo.name}
              href={logo.url}
            >
              <Image
                className={`

                   h-auto ${logo.style}`}
                src={theme === 'light' ? logo.srcLight : logo.srcDark}
                alt={`${logo.name} Logo`}
                title={logo.name}
                height={100}
                width={logo.width}
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
