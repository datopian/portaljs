import { Player } from '@lottiefiles/react-lottie-player'
import { H2, H3 } from '../custom/header'
import { ro } from 'date-fns/locale'

export const Testimonials = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Data Officer, City Government',
      quote:
        '"PortalJS Cloud allowed us to launch our open data initiative in days instead of months. The platform is intuitive and our users love the experience."',
      image: '/static/img/home/62-100x100.jpg',
      style: '',
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Research Director, University',
      quote:
        '"We needed a compliant, secure solution for sharing research data. PortalJS Cloud met all our requirements and was surprisingly easy to implement."',
      image: '/static/img/home/64-100x100.jpg',
      style: '',
    },
    {
      name: 'Emma Rodriguez',
      role: 'IT Manager, Non-profit Organization',
      quote:
        '"The support team has been exceptional. They helped us migrate our legacy data and provided training for our staff. Highly recommended."',
      image: '/static/img/home/65-100x100.jpg',
      style: '',
    },
  ]

  return (
    <div className="py-24">
      <div className="">
        <H2 className="text-center mb-4">
          Trusted by Data Publishers Worldwide
        </H2>
        <H3 className="opacity-75 text-center ">
          Join hundreds of organizations that trust PortalJS Cloud for their
          data publishing needs.
        </H3>
        <div className="mt-16 grid grid-cols-1 gap-y-12 sm:gap-x-12 lg:grid-cols-3 lg:gap-x-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="relative flex flex-col rounded-xl dark:bg-slate-900 dark:hover:bg-slate-800 hover:bg-slate-100 transition-all duration-300 ring-1 ring-slate-200 dark:ring-slate-800 p-7 gap-7 rounded-lg shadow-lg overflow-hidden"
            >
              <p className=" text-base opacity-75">{testimonial.quote}</p>
              <div className="flex-shrink-0 w-full flex items-start gap-4 mt-auto ">
                <img
                  src={testimonial.image}
                  className={`w-14 h-14 ${testimonial.style} rounded-full`}
                />
                <div className="">
                  <h3 className="text-lg font-medium ">{testimonial.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
