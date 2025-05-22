import { H2, H3 } from '@/components/custom/header'
import { useTheme } from 'next-themes'
import { Player } from '@lottiefiles/react-lottie-player'

export default function UserJourney() {
  const { theme } = useTheme()
  const steps = [
    {
      id: 1,
      title: 'Set up your portal',
      description: 'Create your account to get started with PortalJS Cloud.',
      image: '/static/img/home/skeleton0.webp',
      icon: `/static/icons/${theme}/settings2.json`,
      class: "w-28 h-28"
    },
    {
      id: 2,
      title: 'Upload your datasets',
      description: 'Easily upload your datasets to the platform.',
      image: '/static/img/home/skeleton1.webp',
      icon: `/static/icons/${theme}/upload.json`,
      class: "w-28 h-28"
    },
    {
      id: 3,
      title: 'Style your portal (optional)',
      description: 'Personalize your portal to match your needs.',
      image: '/static/img/home/skeleton2.webp',
      icon: `/static/icons/${theme}/stationery.json`,
      class: "w-20 h-20"
    },
    {
      id: 4,
      title: 'Launch to the world',
      description: 'Share your portal with your audience globally.',
      image: '/static/img/home/skeleton3.webp',
      icon: `/static/icons/${theme}/rocket.json`,
      class: "w-20 h-20"
    },
  ]
  return (
    <div className="!max-w-none ring-1 ring-slate-200 dark:ring-slate-800 py-24 bg-zinc-50 dark:bg-slate-800/75 mt-24 relative overflow-hidden">
      <div className="text-center z-40 ">
        <H2 className="">Get Started in 4 Easy Steps</H2>
        <H3 className="mt-4 opacity-75 ">
          Follow these simple steps to launch your data portal effortlessly.
        </H3>
      </div>
      <div className="relative max-w-8xl px-4 sm:px-8 xl:px-12 mx-auto ">
        <div className="mt-12 grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 ">
          {steps.map((step) => (
            <div key={step.id} className=" !z-40 dark:bg-slate-900 bg-white ring-1 ring-slate-200 dark:ring-slate-800 rounded-lg rounded-lg shadow-lg p-6">
              {step.icon && (
                <div className="">
                  <div className='w-full flex items-center justify-center dark:bg-slate-800 bg-slate-100 h-[160px] rounded-md'>
                    <Player
                      autoplay
                      loop
                      src={step.icon}
                      className={step.class}
                    />
                  </div>
                  <div className="flex items-center justify-center w-16 h-6 px-2 text-sm !z-50 mr-auto bg-blue-500 text-white rounded-xl mt-4">
                    Step {step.id}
                  </div>
                </div>
              )}
              <H3 className="mt-4 text-lg font-medium text-black dark:text-white">{step.title}</H3>
              <p className="mt-2 ">{step.description}</p>
            </div>
          ))}
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-x-0 -top-16  flex transform-gpu justify-center overflow-hidden blur-3xl"
        >
          <div
            style={{
              clipPath:
                'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
            }}
            className="aspect-[1318/752] w-[82.375rem] flex-none bg-gradient-to-r from-[#80caff] to-[#4f46e5] opacity-25 rotate-[240deg]"
          />
        </div>
      </div>
    </div>
  )
}
