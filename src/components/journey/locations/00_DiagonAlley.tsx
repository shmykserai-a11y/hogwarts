'use client'

import React, { useState, useEffect, useRef } from 'react'
import { JourneyLocationBase, preloadJourneyLocation } from './JourneyLocationBase'
import { usePuzzleLocationIndex } from '@/hooks/use-puzzle-scroll'
import { useHitZoneStore } from '@/hooks/use-hitzones'
import { HitZone } from '../HitZone'
import { useStore } from '@/lib/store'

interface DiagonAlleyProps {
    position?: [number, number, number]
    index?: number
}

const BG_URL      = '/textures/journey/diagon-alley/background.webp'
const PASSAGE_URL = '/textures/journey/diagon-alley/passage.png'

// The initial hit zones (normalized coordinates -0.5 to 0.5)
const INITIAL_ZONES = [
    { id: 0, x: 0.085, y: 0.098, w: 0.06, h: 0.06 },
    { id: 1, x: 0.22, y: 0.1, w: 0.058, h: 0.057 },
    { id: 2, x: 0.26, y: -0.036, w: 0.06, h: 0.05 },
    { id: 3, x: 0.085, y: -0.2, w: 0.06, h: 0.056 },
    { id: 4, x: 0.144, y: -0.06, w: 0.065, h: 0.063 },
    { id: 5, x: 0.228, y: -0.185, w: 0.061, h: 0.055 }, 
]

function shuffle(array: number[]) {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
}

const REVEAL_DURATION = 2500 // ms

export function DiagonAlley({ position = [0, 0, 0], index = 0 }: DiagonAlleyProps) {
    const locationIndex = usePuzzleLocationIndex()
    const { setAddZoneCallback } = useHitZoneStore()
    const { unlockNextPuzzle, maxUnlockedIndex, markJourneyCompleted } = useStore()

    // Puzzle state
    const [sequence, setSequence] = useState<number[]>([])
    const [currentStep, setCurrentStep] = useState(0)
    const [zones, setZones] = useState(INITIAL_ZONES)

    // Reveal crossfade state
    const [revealProgress, setRevealProgress] = useState(0)
    const rafRef = useRef<number | null>(null)
    const revealStartRef = useRef<number | null>(null)

    const dist = Math.abs(locationIndex - index)
    const isActive = dist < 0.5

    // Start the crossfade animation when puzzle is solved
    const startReveal = () => {
        revealStartRef.current = performance.now()
        const tick = (now: number) => {
            const elapsed = now - (revealStartRef.current ?? now)
            const p = Math.min(elapsed / REVEAL_DURATION, 1)
            setRevealProgress(p)
            if (p < 1) {
                rafRef.current = requestAnimationFrame(tick)
            }
        }
        rafRef.current = requestAnimationFrame(tick)
    }

    // Cleanup RAF on unmount
    useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }, [])

    useEffect(() => {
        if (isActive) {
            setAddZoneCallback(() => {
                setZones(prev => [...prev, {
                    id: Date.now(),
                    x: 0, y: 0, w: 0.05, h: 0.05
                }])
            })
        } else {
            setAddZoneCallback(null)
        }
        return () => setAddZoneCallback(null)
    }, [isActive, setAddZoneCallback])

    useEffect(() => {
        if (isActive && sequence.length === 0) {
            setSequence(shuffle(zones.map(z => z.id)))
            setCurrentStep(0)
        } else if (!isActive && sequence.length > 0) {
            // Reset everything when leaving
            setSequence([])
            setCurrentStep(0)
            setRevealProgress(0)
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
    }, [isActive, sequence.length, zones])

    const handleZoneClick = (e: any, id: number) => {
        if (!isActive || sequence.length === 0 || revealProgress > 0) return

        if (id === sequence[currentStep]) {
            const nextStep = currentStep + 1
            setCurrentStep(nextStep)

            if (nextStep === sequence.length) {
                // Puzzle solved! Start crossfade
                markJourneyCompleted('diagon')
                if (maxUnlockedIndex === index) unlockNextPuzzle()
                startReveal()
            }
        } else {
            setCurrentStep(0)
        }
    }

    const solved = revealProgress > 0

    return (
        <JourneyLocationBase
            index={index}
            position={position}
            bgUrl={BG_URL}
            revealUrl={PASSAGE_URL}
            revealProgress={revealProgress}
            disableBobbing={true}
        >
            {/* Hit zones — hidden once reveal starts */}
            {isActive && !solved && zones.map((zone) => {
                const isHighlighted = sequence.length > 0 && currentStep > sequence.indexOf(zone.id)
                return (
                    <HitZone
                        key={zone.id}
                        id={zone.id}
                        initialX={zone.x}
                        initialY={zone.y}
                        initialW={zone.w}
                        initialH={zone.h}
                        isHighlighted={isHighlighted}
                        onClick={(e) => handleZoneClick(e, zone.id)}
                    />
                )
            })}
        </JourneyLocationBase>
    )
}

// Preload both textures
preloadJourneyLocation(BG_URL)
preloadJourneyLocation(PASSAGE_URL)
