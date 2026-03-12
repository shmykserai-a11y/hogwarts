'use client'

import { useEffect } from 'react'
import { JourneyLocationBase, preloadJourneyLocation } from './JourneyLocationBase'
import { FruitNinjaCandles } from '../FruitNinjaCandles'
import { usePuzzleLocationIndex } from '@/hooks/use-puzzle-scroll'
import { useFruitNinjaStore } from '@/hooks/use-fruitninja'
import { useStore } from '@/lib/store'

interface GreatHallProps {
    position?: [number, number, number]
    /** Index of this location in the puzzle sequence (0-based) */
    index?: number
}

const BG_URL = '/textures/journey/great-hall/background.webp'

export function GreatHall({ position = [0, 0, 0], index = 2 }: GreatHallProps) {
    const locationIndex = usePuzzleLocationIndex()
    const { won } = useFruitNinjaStore()
    const { maxUnlockedIndex, unlockNextPuzzle, markJourneyCompleted } = useStore()

    // Match Snape Cauldron pattern: only active when squarely on this location
    const isActive = Math.round(locationIndex) === index

    // Gate: unlock next location once, after the candle minigame is won.
    useEffect(() => {
        if (!isActive) return
        if (!won) return
        markJourneyCompleted('great_hall_candles')
        if (maxUnlockedIndex === index) unlockNextPuzzle()
    }, [isActive, won, maxUnlockedIndex, index, unlockNextPuzzle, markJourneyCompleted])

    return (
        <>
            {/* 1. Base Parallax Background (The Hall Ceiling) */}
            <JourneyLocationBase
                index={index}
                position={position}
                bgUrl={BG_URL}
                // No fgUrl - we use the minigame candles instead
            />

            {/* 2. Interactive Minigame Layer (Candles) */}
            <FruitNinjaCandles isActive={isActive} worldPosition={position} />
        </>
    )
}

// Preload texture to avoid popping
preloadJourneyLocation(BG_URL)
