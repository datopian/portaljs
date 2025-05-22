import { H2, H3 } from '../custom/header'
import ReactPlayer from 'react-player'

export const PortalPreview = () => {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <H2 className="text-center">See PortalJS Cloud in Action</H2>
      <H3 className="text-center">
        Watch a quick demo to see how easy it is to set up and use your data
        portal.
      </H3>
      <div className="mt-16">
        <video
          controls
          muted
          autoPlay
          className="w-full ring-1 ring-slate-200 dark:ring-slate-800 rounded-xl"
        >
          <source src="/static/vid/portaljs-cloud-quick-demo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  )
}
