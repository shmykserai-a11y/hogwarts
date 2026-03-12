'use client'

import { JourneyLocationBase, preloadJourneyLocation } from './JourneyLocationBase'

const BG_URL = '/textures/journey/aragog/background.webp'
const FG_URL = '/textures/journey/aragog/foreground.webp'

preloadJourneyLocation(BG_URL, FG_URL)

interface AragogForestProps {
    position?: [number, number, number]
    index?: number
}

export function AragogForest({ position = [0, 0, 0], index = 5 }: AragogForestProps) {
    return (
        <JourneyLocationBase
            index={index}
            position={position}
            bgUrl={BG_URL}
            fgUrl={FG_URL}
            bobbingMode='z'
        />
    )
}
