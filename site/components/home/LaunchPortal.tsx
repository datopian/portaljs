import { CheckIcon } from '@heroicons/react/24/solid'
import { H2, H3 } from '../custom/header'
import ButtonLink from '../ButtonLink'

export default function LaunchPortal() {
  return (
    <div className="relative max-w-none w-full flex justify-center py-24">
      <div className="">
        <div className="flex flex-col lg:flex-row gap-32 lg:justify-between">
          <div className="!z-40">
            <H2 className=" mb-2 leading-[3rem]">
              Launch your data portal in minutes
            </H2>
            <H3 className=" mb-4 max-w-2xl">
              Meet <b>PortalJS Cloud</b> — <b>the only solution on the market</b>{' '} 
              that combines full public-sector compliance, metadata backend compatibility,
              AI-powered features, and instant deployment — all in a fully
              managed package.
            </H3>
            <div className="mt-6">
              <ButtonLink
                href="https://cloud.portaljs.com/auth/signup"
                title="Deploy your data portal with PortalJS Cloud"
                className="text-sm"
                trackConversion={true}
              >
                Deploy your data portal
              </ButtonLink>
            </div>
            {/* <ul className="list-none list-inside mb-4  flex flex-col gap-1">
              <li className="">
                <div className="flex items-center gap-2">
                  <CheckIcon width={14} height={14} className="text-blue-400" />{' '}
                  Sign up for an account
                </div>
              </li>
              <li className="">
                <div className="flex items-center gap-2">
                  <CheckIcon width={14} height={14} className="text-blue-400" />{' '}
                  Upload your datasets
                </div>
              </li>
              <li className="">
                <div className="flex items-center gap-2">
                  <CheckIcon width={14} height={14} className="text-blue-400" />{' '}
                  Customize your portal
                </div>
              </li>
              <li className="">
                <div className="flex items-center gap-2">
                  <CheckIcon width={14} height={14} className="text-blue-400" />{' '}
                  Launch to the world
                </div>
              </li>
            </ul> */}
          </div>
          <div className="relative ">
            <video
              muted
              autoPlay
              className="w-full  relative bg-black z-10 max-w-5xl rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 "
              loop
            >
              <source
                src="/static/vid/portaljs-loop-video.mp4"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
            <div className="absolute bottom-0 left-0  bg-gradient-to-t from-black to-transparent !z-20"></div>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-16 flex transform-gpu justify-center overflow-hidden blur-3xl"
        >
          <div
            style={{
              clipPath:
                'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
            }}
            className="aspect-[1318/752] w-[82.375rem] rotate-270 flex-none bg-gradient-to-r from-[#80caff] to-[#4f46e5] opacity-25 !-z-10"
          />
        </div>
      </div>
    </div>
  )
}
