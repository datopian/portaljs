import React from 'react'

type HeroProps = {
  productName: string
  description?: string
}

export default function Hero({ productName, description }: HeroProps) {
  const heroDescription =
    description ??
    `Transform ${productName}'s technical interface into user-friendly, customized data catalogs for business users.`

  return (
    <div
      className="overflow-hidden -mb-32 mt-[-4.5rem] pb-32 pt-[4.5rem] lg:mt-[-4.75rem] lg:pt-[4.75rem]"
      id="hero"
    >
      <div className="py-16 sm:px-2 lg:relative lg:py-20 lg:px-0">
        <div className="mx-auto max-w-2xl px-4 lg:max-w-8xl lg:px-8 xl:px-12">
          <div className="relative mb-10 lg:mb-0 text-center">
            <h1 className="inline bg-gradient-to-r from-sky-400 to-blue-600 bg-clip-text text-5xl tracking-tight text-transparent font-bold leading-[1.08]">
              {productName} & PortalJS
            </h1>
            <p className="mt-8 text-xl tracking-tight text-slate-600 dark:text-slate-400">
              {heroDescription}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <a
                href="https://calendar.app.google/sn2PU7ZvzjCPo1ok6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-br from-sky-400 to-blue-600 px-[18px] py-2.5 text-[14.5px] font-semibold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)] transition-all duration-150 hover:-translate-y-px hover:shadow-[0_10px_28px_-8px_rgba(37,99,235,0.7)]"
              >
                Book a Free Consultation
              </a>
              <a
                href="https://demo.portaljs.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-slate-300 bg-white px-[18px] py-2.5 text-[14.5px] font-semibold text-slate-700 transition-all duration-150 hover:-translate-y-px hover:border-blue-400 hover:text-blue-600"
              >
                Live Demo
              </a>
            </div>
            <div className="flex flex-col items-center mt-16">
              <video
                controls
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                width="800"
                className="rounded-2xl shadow-md"
              >
                <source
                  src="https://qvnmpnsjkalzxdo4.public.blob.vercel-storage.com/portaljs.com/omd-template-demo.mp4"
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </div>

            <div className="mt-16 mb-12 flex flex-col md:flex-row items-center justify-center gap-16">
              <div className="bg-slate-800 dark:bg-slate-900 p-8 rounded-xl w-full md:w-1/2 relative">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-600 text-white text-[11px] font-semibold tracking-wide uppercase px-4 py-1.5 rounded-full shadow-sm">
                  Without PortalJS
                </div>
                <h3 className="text-white text-lg mb-5">
                  Technical {productName} UI
                </h3>
                <ul className="text-left text-slate-300 text-sm space-y-3">
                  <li className="flex items-start gap-2">
                    <svg className="shrink-0 mt-0.5 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 16 16"><path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M4 4l8 8M12 4l-8 8"/></svg>
                    <span>Complex, developer-oriented UI</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="shrink-0 mt-0.5 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 16 16"><path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M4 4l8 8M12 4l-8 8"/></svg>
                    <span>Hard for business users to explore metadata</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="shrink-0 mt-0.5 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 16 16"><path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" d="M4 4l8 8M12 4l-8 8"/></svg>
                    <span>Limited frontend customization</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-800 shadow-md ring-1 ring-blue-200 dark:ring-blue-800 p-8 rounded-xl w-full md:w-1/2 relative">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gradient-to-br from-sky-400 to-blue-600 text-white text-[11px] font-semibold tracking-wide uppercase px-4 py-1.5 rounded-full shadow-sm">
                  With PortalJS
                </div>
                <h3 className="text-slate-900 dark:text-white text-lg font-semibold mb-5">
                  Business-Friendly UI
                </h3>
                <ul className="text-left text-slate-700 dark:text-slate-200 text-sm font-medium space-y-3">
                  <li className="flex items-start gap-2">
                    <svg className="shrink-0 mt-0.5 w-4 h-4 text-blue-500" fill="none" viewBox="0 0 16 16"><path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M3 8l3.5 3.5L13 4.5"/></svg>
                    <span>Clean, user-friendly experience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="shrink-0 mt-0.5 w-4 h-4 text-blue-500" fill="none" viewBox="0 0 16 16"><path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M3 8l3.5 3.5L13 4.5"/></svg>
                    <span>Tailored portals for every department</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="shrink-0 mt-0.5 w-4 h-4 text-blue-500" fill="none" viewBox="0 0 16 16"><path stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" d="M3 8l3.5 3.5L13 4.5"/></svg>
                    <span>Fully customizable interface & workflows</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
