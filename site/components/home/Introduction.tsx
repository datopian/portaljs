import { Player } from '@lottiefiles/react-lottie-player'
import { H2 } from '../custom/header'

const Introduction = () => {
  return (
    <div className="mt-16 ">
      <div className="mb-32 ">
        <H2 className="text-4xl font-bold mb-8">
          Imagine Launching Your Data Portal in Minutes—Without Technical Help
        </H2>
        <p className="text-lg  mb-4">
          If setting up and running an open data portal feels like it costs too
          much, takes too long, and requires too many approvals—you&#39;re not
          alone.
        </p>
        <p className="text-lg  mb-4">
          PortalJS Cloud is the only solution on the market that combines full
          public-sector compliance, CKAN compatibility, AI-powered features, and
          instant deployment—all in a fully managed package.
        </p>
        <p className="text-lg  mb-4">
          No procurement hurdles. No vendor lock-in. No six-figure invoices.
          <br />
          Just a modern, compliant data portal—live in minutes, not months.
        </p>
        <div className="flex  py-8">
          <blockquote className="ml-auto italic border-l-4 border-gray-300 pl-4 text-2xl">
            “We deployed in a day. No engineers. No vendors breathing down our
            neck.”
            <br />— Client Name
          </blockquote>
        </div>
      </div>
      <div className="mb-32">
        <div className="mb-4">
          <h3 className="text-sm text-blue-400 font-bold uppercase mb-4 ">
            The Hidden Cost of Proprietary Portals
          </h3>
          <p className="text-3xl font-bold mb-8">
            Why does launching an open data portal still feel so painful?
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 ">
            <li className="flex items-center font-bold">
              <Player
                autoplay
                loop
                src="/static/icons/ewallet.json"
                className="pr-1 w-20 h-auto -rotate-[4deg]"
              />
              Six figures or more per year in vendor fees
            </li>
            <li className="flex items-center font-bold">
              <Player
                autoplay
                loop
                src="/static/icons/hexagonal.json"
                className="pr-1 w-20 h-auto -rotate-[4deg]"
              />
              Rigid platforms with no flexibility
            </li>
            <li className="flex items-center font-bold">
              <Player
                autoplay
                loop
                src="/static/icons/html.json"
                className="pr-1 w-20 h-auto -rotate-[4deg]"
              />
              Long deployment cycles
            </li>
            <li className="flex items-center font-bold">
              <Player
                autoplay
                loop
                src="/static/icons/flow-chart.json"
                className="pr-1 w-20 h-auto -rotate-[4deg]"
              />
              Painful metadata workflows
            </li>
            <li className="flex items-center font-bold">
              <Player
                autoplay
                loop
                src="/static/icons/copy.json"
                className="pr-1 w-20 h-auto -rotate-[4deg]"
              />
              Vendor lock-in & outdated UI
            </li>
          </ul>
          <p className="text-3xl font-semibold mt-8">
            PortalJS Cloud is the antidote.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Introduction
