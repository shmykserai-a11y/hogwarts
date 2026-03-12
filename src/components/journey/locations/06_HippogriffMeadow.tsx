'use client'

import { JourneyLocationBase, preloadJourneyLocation } from './JourneyLocationBase'

const BG_URL = '/textures/journey/hippogriff/background.webp'
const FG_URL = '/textures/journey/hippogriff/foreground.webp'

preloadJourneyLocation(BG_URL, FG_URL)

interface HippogriffProps {
    position?: [number, number, number]
    index?: number
}

export function HippogriffMeadow({ position = [0, 0, 0], index = 6 }: HippogriffProps) {
    return (
        <JourneyLocationBase
            index={index}
            position={position}
            bgUrl={BG_URL}
            fgUrl={FG_URL}
        />
    )
}
