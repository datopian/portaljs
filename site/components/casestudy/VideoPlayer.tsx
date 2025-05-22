import React, { useRef, useState } from 'react'
import { FaPlay, FaPause } from 'react-icons/fa'

export default function VideoPlayer() {
  const videoRef = useRef<null | HTMLVideoElement>()
  const [isPlaying, setIsPlaying] = useState(false)

  const videoHandler = (control) => {
    if (videoRef?.current) {
      if (control === 'play') {
        videoRef.current.play()
        setIsPlaying(true)
      } else if (control === 'pause') {
        videoRef.current.pause()
        setIsPlaying(false)
      }
    }
  }

  const handleVideoClick = () => {
    if (isPlaying) videoHandler('pause')
    else videoHandler('play')
  }

  return (
    <div className="max-w-8xl rounded-lg h-full relative group">
      <video
        id="unique-video-id"
        ref={videoRef}
        onClick={handleVideoClick}
        src="https://media.w3.org/2010/05/sintel/trailer_hd.mp4"
        className="w-full h-full object-cover rounded-lg"
      >
        Your browser does not support the video tag.
      </video>
      {!isPlaying && (
        <div
          onClick={handleVideoClick}
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg cursor-pointer"
        >
          <button className="text-white text-4xl opacity-80 ">
            <FaPlay />
          </button>
        </div>
      )}
      {isPlaying && (
        <div
          onClick={handleVideoClick}
          className="absolute bg-black bg-opacity-50 inset-0 items-center justify-center rounded-lg cursor-pointer group-hover:flex hidden"
        >
          <button className="text-white text-4xl opacity-50  p-4 rounded-full">
            <FaPause />
          </button>
        </div>
      )}
    </div>
  )
}
