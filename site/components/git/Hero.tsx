import React from 'react';
import ButtonLink from '../ButtonLink';

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
              Git & PortalJS
            </h1>
            <p className="mt-4 text-xl tracking-tight text-slate-400">
              Build modern data portals with Git as your backend. Version-controlled, collaborative, and completely decentralized.
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
              href="https://github.com/datopian/portaljs/tree/main/examples/github-backed-catalog"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Example
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}