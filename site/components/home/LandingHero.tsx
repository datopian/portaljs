import siteConfig from '@/config/siteConfig'
import CycloneLogo from './CycloneLogo'
import AgentFlow from './AgentFlow'
import GitHubIcon from '../icons/GitHubIcon'
import DiscordIcon from '../icons/DiscordIcon'

export default function LandingHero() {
  return (
    <section className="mx-auto py-12 sm:py-20">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* left: message + CTAs */}
        <div className="text-center lg:text-left">
          <div className="flex justify-center lg:justify-start mb-8">
            <CycloneLogo size={72} />
          </div>

          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-semibold tracking-tight bg-gradient-to-r from-sky-300 via-sky-400 to-blue-600 bg-clip-text text-transparent pb-2">
            The AI-native framework for data portals.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0">
            Describe the portal you want — your AI assistant scaffolds it and
            loads your data in minutes. Open source, no lock-in.
          </p>

          <div className="mt-9 flex flex-wrap gap-4 justify-center lg:justify-start">
            <a
              href="/opensource"
              title="Get started with PortalJS"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full font-semibold text-white bg-gradient-to-r from-sky-500 to-blue-600 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:from-sky-400 hover:to-blue-500 hover:-translate-y-0.5"
            >
              Get started
            </a>
            <a
              href={siteConfig.github}
              target="_blank"
              rel="noopener noreferrer"
              title="Star PortalJS on GitHub"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all duration-300 hover:border-blue-400 hover:text-blue-500"
            >
              <span className="w-5 h-5">
                <GitHubIcon />
              </span>
              Star on GitHub
            </a>
            <a
              href={siteConfig.discord}
              target="_blank"
              rel="noopener noreferrer"
              title="Join the PortalJS Discord"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 transition-all duration-300 hover:border-indigo-400 hover:text-indigo-500"
            >
              <DiscordIcon className="w-5 h-5" />
              Join Discord
            </a>
          </div>
        </div>

        {/* right: the hero animation */}
        <div className="w-full">
          <AgentFlow />
        </div>
      </div>
    </section>
  )
}
