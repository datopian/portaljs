import React from 'react';
import ButtonLink from './ButtonLink';
import Image from 'next/image';
export default function Hero() {
  return (
    <div
      className="overflow-hidden -mb-32 mt-[-4.5rem] pb-32 pt-[4.5rem] lg:mt-[-4.75rem] lg:pt-[4.75rem]"
      id="hero"
    >
      <div className="py-16 sm:px-2 lg:relative lg:py-20 lg:px-0">
        <div className="mx-auto max-w-2xl px-4 lg:max-w-8xl lg:px-8 xl:px-12">
          <div className="relative mb-10 lg:mb-0 text-center">
            <h1 className="inline bg-gradient-to-r from-blue-500 via-blue-300 to-blue-500 bg-clip-text text-5xl tracking-tight text-transparent">
              The JavaScript framework for data portals
            </h1>
            <p className="mt-4 text-xl tracking-tight text-slate-400">
              Rapidly build rich data portals using a modern frontend framework.
            </p>
            <ButtonLink
              href="/opensource/docs"
              title="Read the docs"
              className="text-sm mr-2"
            >
              Read the docs
            </ButtonLink>
            <ButtonLink
              style="secondary"
              className="mt-8 text-sm"
              title="Deploy on Vercel"
              href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdatopian%2Fportaljs-frontend-starter&env=NEXT_PUBLIC_DMS&envDescription=DMS%20endpoint%2C%20e.g.%2C%20a%20CKAN%20instance%20URL.%20For%20testing%20purposes%2C%20you%20can%20use%20https%3A%2F%2Fapi.cloud.portaljs.com%2F&project-name=my-portaljs-app&repository-name=my-portaljs-app"
            >
              Deploy on Vercel
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
        </div>
      </div>
    </div>
  );
}