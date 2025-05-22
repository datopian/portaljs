import siteConfig from '@/config/siteConfig'
import { getContributorsCount, getRepoInfo } from '@/lib/getGitHubData'
import { StarIcon, UsersIcon } from '@heroicons/react/24/solid'
import { useEffect, useState } from 'react'
import GitHubIcon from '../icons/GitHubIcon'
import { H2, H3 } from '../custom/header'
import DiscordIcon from '../icons/DiscordIcon'
import EmailIcon from '../icons/EmailIcon'

const Stat = ({ title, value, ...props }) => {
  return (
    <div {...props} className="flex flex-col justify-center items-center">
      <span className="text-4xl sm:text-6xl font-bold text-secondary">
        {value}
      </span>
      <p className="text-lg font-medium">{title}</p>
    </div>
  )
}

const IconButton = ({ Icon, text, href, ...props }) => {
  return (
    <div {...props}>
      <a
        className="rounded border border-secondary px-5 py-3 text-primary dark:text-primary-dark flex items-center hover:bg-secondary hover:text-primary dark:hover:text-primary transition-all duration-200"
        href={href}
      >
        <Icon className="w-6 h-6 mr-2" />
        {text}
      </a>
    </div>
  )
}

export default function Community({ homePage }: { homePage: boolean }) {
  const [repoInfo, setRepoInfo] = useState<any>()
  const [contributorsCount, setContributorsCount] = useState('')

  useEffect(() => {
    //  This runs on client side and it's unlikely that users
    //  will exceed the GitHub API  usage limit,  but added a
    //  handling for that just in case.

    getRepoInfo().then((res) => {
      if (res.success) {
        res.info.then((data) => setRepoInfo(data))
      } else {
        //  If the request fail e.g API usage limit, use
        //  a placeholder
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
    <div className="prose-a:no-underline relative py-24 " id="contact">
      <div className="relative max-w-8xl mx-auto flex flex-col items-center">
        <div className="text-center">
          <H2>Backed by a Global Community</H2>
          <H3 className="mb-4">
            We are growing. Get in touch or become a contributor!
          </H3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 justify-center mt-12 gap-14 md:items-stretch items-center">
          <a
            className="h-auto flex flex-col justify-between relative w-full p-6 bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 hover:bg-slate-100 transition-all  shadow-lg rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 text-center"
            href="https://github.com/datopian/portaljs "
          >
            <div className="flex justify-center -mt-10">
              <div className="bg-yellow-100 text-yellow-500 p-4 rounded-full shadow-md">
                <StarIcon width={40} />
              </div>
            </div>
            <p className="opacity-80 text-sm mt-2">
              This repository is shining bright with:
            </p>
            <p className="text-5xl font-bold text-yellow-500 mt-4">
              {repoInfo?.stargazers_count}
            </p>
            <h2 className="mt-4 text-2xl font-bold">Stars</h2>
            <p className="opacity-70 text-sm mt-4">
              Thank you for your support! 🌟
            </p>
          </a>
          <a
            className="h-auto flex flex-col justify-between relative w-full p-6 bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 hover:bg-slate-100 transition-all  shadow-lg rounded-2xl ring-1 ring-slate-200 dark:ring-slate-800 text-center"
            href="https://github.com/datopian/portaljs"
          >
            <div className="flex justify-center -mt-10">
              <div className="bg-blue-100 text-blue-500 p-4 rounded-full shadow-md">
                <UsersIcon width={40} />
              </div>
            </div>
            <p
              className={`opacity-80 text-sm mt-2 ${
                homePage ? 'text-nowrap' : ''
              }`}
            >
              Incredible developers contributing their brilliance:
            </p>
            <p className="text-5xl font-bold text-blue-500 mt-4">
              {contributorsCount}
            </p>
            <h2 className="mt-4 text-2xl font-bold">Contributors</h2>
            <p className="opacity-70 text-sm mt-4">
              Join the team! and make an impact! 👩‍💻👨‍💻
            </p>
          </a>
        </div>
        {!social && (
          <div className="flex flex-col sm:flex-row gap-x-8 items-center">
            <a
              href={siteConfig.github}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit h-[50px] mt-[40px] flex gap-[14px] justify-center items-center  text-center py-3 px-6 bg-gradient-to-r from-secondary to-blue-600 text-white font-semibold rounded-full shadow-lg hover:from-blue-600 hover:to-blue-800 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="w-[24px] h-[24px]">
                <GitHubIcon />
              </div>

              <p className="text-nowrap">View on GitHub</p>
            </a>
            <a
              className="w-fit h-[50px] mt-[40px] flex gap-[14px] justify-center items-center  text-center py-3 px-6 bg-gradient-to-r from-secondary to-blue-600 text-white font-semibold rounded-full shadow-lg hover:from-blue-600 hover:to-blue-800 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              href={siteConfig.discord}
            >
              <DiscordIcon className="w-6 h-6 mr-2" />
              <p className="text-nowrap">Join the Discord server</p>
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
