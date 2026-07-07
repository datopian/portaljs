'use client'

import dynamic from 'next/dynamic'
import type { IPlayerProps } from '@lottiefiles/react-lottie-player'

// Lottie Player class types predate React 19; cast the module, keep props typed via the generic.
const Player = dynamic<IPlayerProps>(
  () => import('@lottiefiles/react-lottie-player').then(mod => mod.Player as any),
  { ssr: false }
)

export default function LottiePlayer(props: IPlayerProps) {
  return <Player {...props} />
}
