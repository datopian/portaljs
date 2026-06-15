import siteConfig from '@/config/siteConfig'
import { getContributorsCount, getRepoInfo } from '@/lib/getGitHubData'
import { StarIcon, UsersIcon } from '@heroicons/react/24/solid'
import { useEffect, useState } from 'react'
import GitHubIcon from '../icons/GitHubIcon'
import DiscordIcon from '../icons/DiscordIcon'

export default function Community({ homePage }: { homePage: boolean }) {
  const [repoInfo, setRepoInfo] = useState<any>()
  const [contributorsCount, setContributorsCount] = useState('')

  useEffect(() => {
    getRepoInfo().then((res) => {
      if (res.success) {
        res.info.then((data) => setRepoInfo(data))
      } else {
        setRepoInfo({ stargazers_count: '+2k' })
      }
    })

    getContributorsCount().then((res) => {
      if (res.success) {
        setContributorsCount(res.count)
      } else {
        setContributorsCount('+70')
      }
    })
  }, [])

  const social = homePage ? true : false
  return (
    <div className="prose-a:no-underline relative py-24" id="contact">
      <div className="relative max-w-8xl mx-auto flex flex-col items-center px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Backed by a Global Community
          </h2>
          <p className="mt-3.5 text-[17px] text-slate-600 dark:text-slate-300">
            We are growing. Get in touch or become a contributor!
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 justify-center mt-12 gap-8 md:items-stretch items-center w-full max-w-2xl">
          <a
            className="h-auto flex flex-col justify-between relative w-full p-8 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-slate-300 dark:hover:ring-slate-700 text-center"
            href="https://github.com/datopian/portaljs"
          >
            <div className="flex justify-center -mt-12">
              <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-400 p-4 rounded-2xl ring-1 ring-amber-100 dark:ring-amber-800/30">
                <StarIcon width={36} />
              </div>
            </div>
            <p className="opacity-80 text-sm mt-4">
              This repository is shining bright with:
            </p>
            <p className="text-5xl font-bold bg-gradient-to-br from-amber-400 to-amber-500 bg-clip-text text-transparent mt-4">
              {repoInfo?.stargazers_count}
            </p>
            <h2 className="mt-4 text-2xl font-bold">Stars</h2>
            <p className="opacity-70 text-sm mt-4">
              Thank you for your support! 🌟
            </p>
          </a>
          <a
            className="h-auto flex flex-col justify-between relative w-full p-8 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-300 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-slate-300 dark:hover:ring-slate-700 text-center"
            href="https://github.com/datopian/portaljs"
          >
            <div className="flex justify-center -mt-12">
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-500 p-4 rounded-2xl ring-1 ring-blue-100 dark:ring-blue-800/30">
                <UsersIcon width={36} />
              </div>
            </div>
            <p className={`opacity-80 text-sm mt-4 ${homePage ? 'text-nowrap' : ''}`}>
              Incredible developers contributing their brilliance:
            </p>
            <p className="text-5xl font-bold bg-gradient-to-br from-sky-400 to-blue-600 bg-clip-text text-transparent mt-4">
              {contributorsCount}
            </p>
            <h2 className="mt-4 text-2xl font-bold">Contributors</h2>
            <p className="opacity-70 text-sm mt-4">
              Join the team! and make an impact! 👩‍💻
            </p>
          </a>
        </div>
        {!social && (
          <div className="flex flex-col sm:flex-row gap-4 items-center mt-10">
            <a
              href={siteConfig.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[10px] bg-gradient-to-br from-sky-400 to-blue-600 px-[18px] py-2.5 text-[14.5px] font-semibold text-white shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)] transition-all duration-150 hover:-translate-y-px hover:shadow-[0_10px_28px_-8px_rgba(37,99,235,0.7)]"
            >
              <div className="w-5 h-5">
                <GitHubIcon />
              </div>
              View on GitHub
            </a>
            <a
              href={siteConfig.discord}
              className="inline-flex items-center gap-2 rounded-[10px] border border-slate-300 bg-white px-[18px] py-2.5 text-[14.5px] font-semibold text-slate-700 transition-all duration-150 hover:-translate-y-px hover:border-blue-400 hover:text-blue-600"
            >
              <DiscordIcon className="w-5 h-5" />
              Join the Discord
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
