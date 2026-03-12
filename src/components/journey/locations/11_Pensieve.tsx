'use client'

import { useEffect } from 'react'
import { JourneyLocationBase, preloadJourneyLocation } from './JourneyLocationBase'
import { usePensieveStore } from '@/hooks/use-pensieve'
import { usePuzzleLocationIndex } from '@/hooks/use-puzzle-scroll'
import { useStore } from '@/lib/store'

const BG_URL = '/textures/journey/pensieve/background.png'

preloadJourneyLocation(BG_URL)

interface PensieveProps {
    position?: [number, number, number]
    index?: number
}

export function PensieveLocation({ position = [0, 0, 0], index = 11 }: PensieveProps) {
    const locationIndex = usePuzzleLocationIndex()
    const { setIsActive, phase, answers, questions } = usePensieveStore()
    const { maxUnlockedIndex, unlockNextPuzzle, markJourneyCompleted } = useStore()

    const isOnLocation = Math.round(locationIndex) === index

    useEffect(() => {
        setIsActive(isOnLocation)
    }, [isOnLocation, setIsActive])

    const completed = phase === 'result' && answers.length === questions.length && answers.every(Boolean)

    useEffect(() => {
        if (!isOnLocation) return
        if (!completed) return
        markJourneyCompleted('pensieve')
        if (maxUnlockedIndex === index) unlockNextPuzzle()
    }, [isOnLocation, completed, maxUnlockedIndex, index, unlockNextPuzzle, markJourneyCompleted])

    return (
        <JourneyLocationBase
            index={index}
            position={position}
            bgUrl={BG_URL}
            bobbingMode='none'
        />
    )
}
