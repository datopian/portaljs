import React from 'react'
import componentAnimation from '../components/icons/animations/settings.json'
import howtosAnimation from '../components/icons/animations/guide.json'
import cloudAnimation from '../components/icons/animations/cloud.json'
import docsAnimation from '../components/icons/animations/book.json'
const iconClass = "animate-float inline-block"
import Lottie from 'react-lottie-player';
import dynamic from "next/dynamic";

const LottiePlayer = dynamic(() => import("react-lottie-player"), { ssr: false });

export const CloudIcon = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={`${iconClass} ${props.className || ''}`} aria-label="cloud">
    <LottiePlayer
      loop
      animationData={cloudAnimation}
      play
      style={{ width: 50, height: 50 }}
    />
  </div>
);
export const ComponentIcon = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={`${iconClass} ${props.className || ''}`} aria-label="component">
    <LottiePlayer
      loop
      animationData={componentAnimation}
      play
      style={{ width: 50, height: 50 }}
    />
  </div>
);

export const HowTosIcon = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={`${iconClass} ${props.className || ''}`} aria-label="how-tos">
    <LottiePlayer
      loop
      animationData={howtosAnimation}
      play
      style={{ width: 250, height: 250 }}
    />
  </div>
);
export const DocsIcon = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className={`${iconClass} ${props.className || ''}`} aria-label="docs">
    <LottiePlayer
      loop
      animationData={docsAnimation}
      play
      style={{ width: 250, height: 250 }}
    />
  </div>
);