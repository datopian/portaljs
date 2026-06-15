import React from 'react';

export default function Hero() {
  return (
    <div
      className="overflow-hidden -mb-32 mt-[-4.5rem] pb-32 pt-[4.5rem] lg:mt-[-4.75rem] lg:pt-[4.75rem]"
      id="hero"
    >
      <div className="py-16 sm:px-2 lg:relative lg:py-20 lg:px-0">
        <div className="mx-auto max-w-2xl px-4 lg:max-w-8xl lg:px-8 xl:px-12">
          <div className="relative mb-10 lg:mb-0 text-center">
            <h1 className="inline bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-5xl font-bold leading-[1.08] tracking-tight text-transparent">
              CKAN & PortalJS
            </h1>
            <p className="mt-4 text-xl tracking-tight text-slate-600 dark:text-slate-400">
              Deliver a modern, decoupled frontend for your CKAN-powered open data portal.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3.5">
              <a
                href="/opensource/docs"
                title="Read the docs"
                className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-br from-sky-400 to-blue-600 px-[18px] py-2.5 text-[14.5px] font-semibold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)] transition-all duration-150 hover:-translate-y-px hover:shadow-[0_10px_28px_-8px_rgba(37,99,235,0.7)]"
              >
                Read the docs
              </a>
              <a
                href="https://cloud.portaljs.com/auth/signup"
                title="Deploy with PortalJS Cloud"
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-slate-300 bg-white px-[18px] py-2.5 text-[14.5px] font-semibold text-slate-700 transition-all duration-150 hover:-translate-y-px hover:border-blue-400 hover:text-blue-600"
              >
                Deploy with PortalJS Cloud
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}