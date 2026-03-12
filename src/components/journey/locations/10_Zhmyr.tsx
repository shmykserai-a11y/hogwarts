'use client'

import { JourneyLocationBase, preloadJourneyLocation } from './JourneyLocationBase'

const BG_URL = '/textures/journey/zhmyr/background.png'
const FG_URL = '/textures/journey/zhmyr/foreground.png'

preloadJourneyLocation(BG_URL, FG_URL)

interface ZhmyrProps {
    position?: [number, number, number]
    index?: number
}

export function ZhmyrLocation({ position = [0, 0, 0], index = 10 }: ZhmyrProps) {
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
