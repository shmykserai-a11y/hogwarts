'use client'

import { JourneyLocationBase, preloadJourneyLocation } from './JourneyLocationBase'

const BG_URL = '/textures/journey/thestral/background.webp'
const FG_URL = '/textures/journey/thestral/foreground.webp'

preloadJourneyLocation(BG_URL, FG_URL)

interface ThestralProps {
    position?: [number, number, number]
    index?: number
}

export function ThestralGrove({ position = [0, 0, 0], index = 8 }: ThestralProps) {
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
