import dynamic from 'next/dynamic'
import { H2, H3 } from '../custom/header'
import { Player } from '@lottiefiles/react-lottie-player'
import { CheckIcon } from '@heroicons/react/24/solid'
const FeatureOverview = () => {
  return (
    <>
      <div className="relative max-w-none w-full flex justify-center py-24">
        <div className="max-w-8xl px-4 sm:px-8 xl:px-12 w-full">
          <div className="flex flex-col lg:flex-row gap-32 lg:justify-between">
            <div className="!z-40">
              <H2 className="text-2xl  font-bold mb-4">
                Let AI Do the Heavy Lifting
              </H2>
              <H3 className="max-w-2xl mb-4">
              Publishing data is easy. Describing it properly? Not so much. That’s why PortalJS Cloud helps you automate the hard parts — so you stay compliant, discoverable, and impactful.
              </H3>
              <p className="mb-4 font-bold">AI Metadata Generation</p>
              <ul className="list-disc list-inside mb-4  flex flex-col gap-1">
                <li className="flex items-center gap-2">
                  <CheckIcon width={14} height={14} className="text-blue-400" />
                  Upload a dataset, and metadata is filled in automatically
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon width={14} height={14} className="text-blue-400 shrink-0 mt-1.5" />
                  Ensure your datasets are searchable and standard-compliant (Dublin Core, DCAT)
                </li>
              </ul>
              <div className="flex items-center gap-3 mb-4">
                <p className=" font-bold"> AI Data Visualizations</p>
                <div className="bg-blue-400 font-bold text-black text-xs flex justify-center items-center px-2 rounded-xl py-1 ">
                  Coming Soon
                </div>
              </div>

              <ul className="list-disc list-inside mb-4  flex flex-col gap-1">
                <li className="flex items-center gap-2">
                  <CheckIcon width={14} height={14} className="text-blue-400" />
                  Generate charts, dashboards, and maps automatically
                </li>
                <li className="flex items-start gap-2">
                  <CheckIcon width={14} height={14} className="text-blue-400 shrink-0 mt-1.5" />
                  Help your audience understand the story behind the data — no coding needed
                </li>
              </ul>
            </div>
            <div className="relative">
              <img
                src="/static/img/frontend-metadata.png"
                alt="Metadate Generation"
                className="rounded-xl h-auto w-full "
              />
              <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#f5f5f5] dark:from-[#020617] to-transparent "></div>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-x-0 -top-16 z-10 flex transform-gpu justify-center overflow-hidden blur-3xl"
          >
            <div
              style={{
                clipPath:
                  'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
              }}
              className="aspect-[1318/752] w-[82.375rem] flex-none bg-gradient-to-r from-[#80caff] to-[#4f46e5] opacity-25"
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default FeatureOverview
