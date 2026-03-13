'use client'

import { useTexture } from '@react-three/drei'
import { JourneyLocationBase, preloadJourneyLocation } from './JourneyLocationBase'
import { withBasePath } from '@/lib/base-path'

interface FarewellProps {
    position?: [number, number, number]
    index?: number
}

const BG_URL = '/textures/journey/farewell/background.webp'
const FG_URL = '/textures/journey/farewell/foreground.webp'
const TEXT_URL = '/textures/journey/farewell/text.webp'

preloadJourneyLocation(BG_URL, FG_URL)
useTexture.preload(withBasePath(TEXT_URL))

export function FarewellLocation({ position = [0, 0, 0], index = 13 }: FarewellProps) {
    return (
        <JourneyLocationBase
            index={index}
            position={position}
            bgUrl={BG_URL}
            midUrl={TEXT_URL}
            fgUrl={FG_URL}
            bobbingMode="z"
        />
    )
}
