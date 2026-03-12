'use client'

import { useEffect } from 'react'
import { JourneyLocationBase, preloadJourneyLocation } from './JourneyLocationBase'
import { QUESTIONS, useSortingHatStore } from '@/hooks/use-sortinghat'
import { usePuzzleLocationIndex } from '@/hooks/use-puzzle-scroll'
import { useStore } from '@/lib/store'

interface SortingHatProps {
    position?: [number, number, number]
    index?: number
}

const BG_URL = '/textures/journey/sorting-hat/hall-background.webp'
const FG_URL = '/textures/journey/sorting-hat/hat-foreground.webp'

preloadJourneyLocation(BG_URL, FG_URL)

export function SortingHat({ position = [0, 0, 0], index = 1 }: SortingHatProps) {
    const locationIndex = usePuzzleLocationIndex()
    const { setIsActive, phase, answers, targetHouse } = useSortingHatStore()
    const { maxUnlockedIndex, unlockNextPuzzle, markJourneyCompleted } = useStore()

    const isOnLocation = Math.round(locationIndex) === index

    useEffect(() => {
        setIsActive(isOnLocation)
    }, [isOnLocation, setIsActive])

    const correctCount = answers.filter((a) => a === targetHouse).length
    const passed = phase === 'verdict' && correctCount >= 3 && answers.length === QUESTIONS.length

    useEffect(() => {
        if (!isOnLocation) return
        if (!passed) return
        markJourneyCompleted('sorting_hat')
        if (maxUnlockedIndex === index) unlockNextPuzzle()
    }, [isOnLocation, passed, maxUnlockedIndex, index, unlockNextPuzzle, markJourneyCompleted])

    return (
        <JourneyLocationBase
            index={index}
            position={position}
            bgUrl={BG_URL}
            fgUrl={FG_URL}
            disableBobbing={true}
        />
    )
}
