import Image from 'next/image'
import { H2, H3 } from '../custom/header'

export const Feature = ({ title, description, image, align = 'left' }) => {
  return (
    <div className="relative my-6 sm:my-8 lg:my-24">
      <div className="lg:grid lg:grid-flow-row-dense lg:grid-cols-2 lg:gap-8 lg:items-center justify-items-center">
        <div className={`max-w-lg ${align === 'right' && 'lg:col-start-2'}`}>
          <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl whitespace-pre-line">
            {title}
          </h3>
          <p className="mt-3 text-base opacity-75">{description}</p>
        </div>
        <div
          className={`mt-10 -mx-4 relative lg:mt-0 ${
            align === 'right' && 'lg:col-start-1'
          }`}
        >
          <Image
            className="relative mx-auto"
            width={400}
            height={400}
            src={image}
            alt={title}
            title={title}
          />
        </div>
      </div>
    </div>
  )
}

export default function Features() {
  return (
    <>
      <div
        id="features"
        className="max-w-8xl mx-auto pt-16 pb-8 px-4 sm:px-6 lg:pt-24 lg:pb-12 lg:px-8 lg:grid lg:gap-x-8 text-center"
      >
        <h2 className="text-base font-semibold text-theme-orange uppercase tracking-wide opacity-75">
          Everything you need
        </h2>
        <H2>Mature, Functional and Polished</H2>
        <H3>
          Get a head-start on your data project using a mature, feature-rich,
          open solution.
        </H3>
      </div>
      <div className="overflow-hidden sm:-mt-24">
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-8xl">
          {features.map((val, i) => (
            <Feature
              key={i}
              align={i % 2 === 0 ? 'right' : 'left'}
              title={val.title}
              description={val.description}
              image={val.image}
            />
          ))}
        </div>
      </div>
    </>
  )
}

const features = [
  {
    title: 'Works out of the box.\n Fully customizable.\n Pick two.',
    description: `Our solution gives you the best of both worlds: the freedom and flexibility of open source with the quality 
      and features of an enterprise product. Ready to go “out of the box” with a rich feature-set, fully configured and elegantly themed.`,
    image: '/static/img/next/code-version-control.png',
  },
  {
    title: 'Open and Flexible',
    description: `Start immediately with a complete set of features with the knowledge that you aren’t locked in to an expensive, inflexible 
      solution as your needs grow and evolve. Our platform’s open-source nature and extensible design mean you have full-freedom to customize 
      and extend the solution to fit your current and future needs.`,
    image: '/static/img/next/open-source.png',
  },
  {
    title: 'More than a data catalog:\n data infrastructure',
    description: `More than a data catalog: it is a framework for building your data management infrastructure 
			including storage integration, rich permissioning, ETL integration, data APIs and more.`,
    image: '/static/img/next/git-request.png',
  },
  {
    title: 'Let your data team focus on insights not logistics',
    description: `Our platform makes data discoverable and accessible so your data team - whether analysts, data scientists or developers- 
      can spend their time analysing and building rather than finding and pipelining.`,
    image: '/static/img/next/pitch-meeting.png',
  },
]
