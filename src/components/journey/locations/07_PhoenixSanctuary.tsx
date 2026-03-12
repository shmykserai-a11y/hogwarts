'use client'

import { JourneyLocationBase, preloadJourneyLocation } from './JourneyLocationBase'

const BG_URL = '/textures/journey/phoenix/background.webp'
const FG_URL = '/textures/journey/phoenix/foreground.webp'

preloadJourneyLocation(BG_URL, FG_URL)

interface PhoenixProps {
    position?: [number, number, number]
    index?: number
}

export function PhoenixSanctuary({ position = [0, 0, 0], index = 7 }: PhoenixProps) {
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
