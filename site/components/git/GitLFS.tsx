import { Player } from '@lottiefiles/react-lottie-player'
import { H2, H3 } from '../custom/header'
import { useTheme } from 'next-themes'
import ButtonLink from '../ButtonLink'

export const GitLFS = () => {
  const { theme } = useTheme()

  return (
    <div className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <H2 className="mb-4">Handling Large Data Files with Git LFS</H2>
          <H3 className="opacity-75 mb-8">
            Git LFS + cloud storage makes Git perfect for datasets of any size.
          </H3>
        </div>

        {/* Traditional Git vs Git LFS Comparison */}
        <div className="mt-16">
          <div className="relative">
            {/* Before/After Header */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Traditional Git</h3>
                <p className="text-gray-600 dark:text-gray-400">Git slows down as data grows</p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Git LFS + Cloud Storage</h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium">Perfect for datasets of any size</p>
              </div>
            </div>

            {/* Comparison Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Traditional Git */}
              <div className="flex">
                <div className="flex-1 rounded-xl dark:bg-slate-900 dark:hover:bg-slate-800 hover:bg-slate-100 transition-all duration-300 ring-1 ring-slate-200 dark:ring-slate-800 p-8 shadow-lg overflow-hidden">
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2">File Size Limitations</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">The challenge everyone talks about</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-red-500 mr-3 flex-shrink-0"></div>
                      <span>100MB file limit on GitHub</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-red-500 mr-3 flex-shrink-0"></div>
                      <span>Repository size limits don't scale for data projects</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-red-500 mr-3 flex-shrink-0"></div>
                      <span>Slow clone and fetch operations</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-red-500 mr-3 flex-shrink-0"></div>
                      <span>Version history bloat with large files</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Git LFS Solution */}
              <div className="flex">
                <div className="flex-1 rounded-xl dark:bg-slate-900 dark:hover:bg-slate-800 hover:bg-slate-100 transition-all duration-300 ring-1 ring-slate-200 dark:ring-slate-800 p-8 shadow-lg overflow-hidden">
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2">Unlimited Scale</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400">Git LFS + Cloud Storage</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-3 flex-shrink-0"></div>
                      <span>Unlimited file sizes with external storage</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-3 flex-shrink-0"></div>
                      <span>Fast repository operations always</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-3 flex-shrink-0"></div>
                      <span>Complete Git workflow compatibility</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-300">
                      <div className="w-2 h-2 rounded-full bg-green-500 mr-3 flex-shrink-0"></div>
                      <span>Automatic file management</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Giftless Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-4">Introducing Giftless: Our Open-Source Git LFS Server</h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Giftless is our flexible, pluggable Git LFS server that seamlessly integrates with popular cloud storage providers.
              Deploy your own LFS infrastructure or use our hosted solution.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Player
                  autoplay
                  loop
                  src={`/static/icons/${theme}/puzzle.json`}
                  className="w-14 h-14"
                />
              </div>
              <h4 className="text-lg font-semibold mb-2">Pluggable Architecture</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Easily extend with custom storage backends, transfer methods, and authentication mechanisms.
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Player
                  autoplay
                  loop
                  src={`/static/icons/${theme}/rocket.json`}
                  className="w-14 h-14"
                />
              </div>
              <h4 className="text-lg font-semibold mb-2">High Performance</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Direct-to-cloud transfers and multipart uploads for optimal performance with large datasets.
              </p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Player
                  autoplay
                  loop
                  src={`/static/icons/${theme}/server-1.json`}
                  className="w-14 h-14"
                />
              </div>
              <h4 className="text-lg font-semibold mb-2">Self-Hosted or Cloud</h4>
              <p className="text-gray-600 dark:text-gray-300">
                Deploy on your infrastructure or use our managed service. MIT licensed and fully open source.
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <ButtonLink
              href="https://github.com/datopian/giftless"
              title="Explore Giftless on GitHub"
              className="text-sm mr-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              Explore Giftless
            </ButtonLink>
            <ButtonLink
              style="secondary"
              href="/opensource/docs"
              title="Read documentation"
              className="mt-8 text-sm"
            >
              Read Documentation
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  )
}