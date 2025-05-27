import React from 'react';
import ButtonLink from '../ButtonLink';
import Image from 'next/image';
import { Player } from '@lottiefiles/react-lottie-player';
import { useTheme } from 'next-themes';

export default function Hero() {
  const { theme } = useTheme();

  return (
    <div
      className="overflow-hidden -mb-32 mt-[-4.5rem] pb-32 pt-[4.5rem] lg:mt-[-4.75rem] lg:pt-[4.75rem]"
      id="hero"
    >
      <div className="py-16 sm:px-2 lg:relative lg:py-20 lg:px-0">
        <div className="mx-auto max-w-2xl px-4 lg:max-w-8xl lg:px-8 xl:px-12">
          <div className="relative mb-10 lg:mb-0 text-center">
            <h1 className="inline bg-gradient-to-r from-blue-500 via-blue-300 to-blue-500 bg-clip-text text-5xl tracking-tight text-transparent">
              OpenMetadata & PortalJS
            </h1>
            <p className="mt-8 text-xl tracking-tight text-slate-400">
              Transform OpenMetadata's technical interface into user-friendly, customized data catalogs for business users.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <ButtonLink
                href="https://calendar.app.google/sn2PU7ZvzjCPo1ok6"
                title="Book a Free Consultation"
                className="text-sm"
              >
                Book a Free Consultation
              </ButtonLink>
            </div>

            <div className="mt-16 mb-12 flex flex-col md:flex-row items-center justify-center gap-8">
              <div className="bg-slate-800 dark:bg-slate-900 p-6 rounded-xl shadow-xl w-full md:w-1/2 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  Without PortalJS
                </div>
                <h3 className="text-white text-lg mb-4">Technical OpenMetadata UI</h3>
                <ul className="text-left text-slate-300 text-sm space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2">❌</span>
                    <span>Complex, developer-oriented UI</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">❌</span>
                    <span>Hard for business users to explore metadata</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">❌</span>
                    <span>Limited frontend customization</span>
                  </li>
                </ul>
              </div>

              <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-xl shadow-xl w-full md:w-1/2 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  With PortalJS
                </div>
                <h3 className="text-slate-800 dark:text-white text-lg mb-4">Business-Friendly UI</h3>
                <ul className="text-left text-slate-700 dark:text-slate-300 text-sm space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2">✅</span>
                    <span>Clean, user-friendly experience</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✅</span>
                    <span>Tailored portals for every department</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">✅</span>
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
