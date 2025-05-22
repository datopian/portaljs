import { useRef } from 'react';
import ButtonLink from './ButtonLink';
import NewsletterForm from './NewsletterForm';
import Image from 'next/image';
import DatahubExampleImg from '@/public/images/showcases/datahub.webp';
/* eslint jsx-a11y/label-has-associated-control: off */
export function Hero() {
  const el = useRef(null);

  return (
    <div
      className="overflow-hidden -mb-32 mt-[-4.5rem] pb-32 pt-[4.5rem] lg:mt-[-4.75rem] lg:pt-[4.75rem]"
      id="hero"
    >
      <div className="py-16 sm:px-2 lg:relative lg:py-20 lg:px-0">
        {/* Commented code on line 37, 39 and 113 will reenable the two columns hero */}
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-y-16 gap-x-8 px-4 lg:max-w-8xl lg:grid-cols-2 lg:px-8 xl:gap-x-16 xl:px-12">
          <div className="relative mb-10 lg:mb-0 md:text-center lg:text-left">
            <div>
              <h1 className="inline bg-gradient-to-r from-blue-500 via-blue-300 to-blue-500 bg-clip-text text-5xl tracking-tight text-transparent">
                The JavaScript framework for data portals
              </h1>
            </div>
            <p className="mt-4 text-xl tracking-tight text-slate-400">
              Rapidly build rich data portals using a modern frontend framework.
            </p>

            <ButtonLink style="secondary" className="mt-8" href="/docs">
              Get started
            </ButtonLink>

            <ButtonLink
              style="primary"
              className="mt-8 ml-3"
              href="https://portaljs.com/"
            >
              PortalJS Cloud
            </ButtonLink>

            <p className="my-10 text-l tracking-wide">
              <span>A project of</span>
              <a
                href="https://www.datopian.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src="/images/datopian_logo.png"
                  alt="Datopian"
                  width={24}
                  height={20}
                  className="mx-2 mb-1 h-6 inline bg-black rounded-full"
                />
                <span>Datopian</span>
              </a>
            </p>
          </div>
          <div className="relative">
            <div className="relative rounded-2xl bg-[#0A101F]/80 ring-1 ring-white/10 backdrop-blur">
              <div className="absolute -top-px left-20 right-11 h-px bg-gradient-to-r from-sky-300/0 via-sky-300/70 to-sky-300/0" />
              <div className="absolute -bottom-px left-11 right-20 h-px bg-gradient-to-r from-blue-400/0 via-blue-400 to-blue-400/0" />
              <Image
                height={400}
                width={600}
                src={DatahubExampleImg}
                alt="opendata.datahub.io"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
