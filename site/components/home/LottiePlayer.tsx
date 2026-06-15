'use client'

import dynamic from 'next/dynamic'
import type { IPlayerProps } from '@lottiefiles/react-lottie-player'

const Player = dynamic(
  () => import('@lottiefiles/react-lottie-player').then(mod => mod.Player),
  { ssr: false }
)

export default function LottiePlayer(props: IPlayerProps) {
  return <Player {...props} />
}
