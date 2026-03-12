'use client'

import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { JourneyLocationBase, preloadJourneyLocation } from './JourneyLocationBase'
import { useSnapeCauldronStore } from '@/hooks/use-snapecauldron'
import { usePuzzleLocationIndex } from '@/hooks/use-puzzle-scroll'
import { HitZone } from '../HitZone'
import { useStore } from '@/lib/store'

interface SnapeCauldronProps {
    position?: [number, number, number]
    index?: number
}

const BG_URL = '/textures/journey/snape-cauldron/dungeon-background.webp'
const FG_URL = '/textures/journey/snape-cauldron/cauldron-foreground.webp'

preloadJourneyLocation(BG_URL, FG_URL)

// ==========================================
// Main Cauldron Component
// ==========================================
export function SnapeCauldron({ position = [0, 0, 0], index = 4 }: SnapeCauldronProps) {
    const { 
        setIsActive, 
        setBrewProgress, 
        evaluateBrew, 
        gameState,
        addedIngredients
    } = useSnapeCauldronStore()
    const { maxUnlockedIndex, unlockNextPuzzle, markJourneyCompleted } = useStore()
    
    const locationIndex = usePuzzleLocationIndex()
    const isActive = Math.round(locationIndex) === index
    
    // Store activation
    useEffect(() => {
        setIsActive(isActive)
    }, [isActive, setIsActive])

    // Gate: unlock next location once, after a successful brew.
    useEffect(() => {
        if (!isActive) return
        if (gameState !== 'success') return
        markJourneyCompleted('snape_cauldron')
        if (maxUnlockedIndex === index) unlockNextPuzzle()
    }, [isActive, gameState, maxUnlockedIndex, index, unlockNextPuzzle, markJourneyCompleted])

    // Boiling / Brewing holding mechanics
    const brewTimer = useRef<NodeJS.Timeout | null>(null)
    const brewTick = useRef<NodeJS.Timeout | null>(null)

    const handleCauldronDown = (e: any) => {
        if (gameState !== 'playing' || addedIngredients.length === 0) return
        e.stopPropagation()
        document.body.style.cursor = 'wait'
        
        let progress = 0
        brewTick.current = setInterval(() => {
            progress += 0.05
            setBrewProgress(Math.min(progress, 1))
        }, 150)

        brewTimer.current = setTimeout(() => {
            if (brewTick.current) clearInterval(brewTick.current)
            evaluateBrew()
            document.body.style.cursor = 'auto'
        }, 3000)
    }

    const cancelBrew = () => {
        if (brewTimer.current) clearTimeout(brewTimer.current)
        if (brewTick.current) clearInterval(brewTick.current)
        if (gameState === 'brewing') {
            setBrewProgress(0)
            document.body.style.cursor = 'auto'
        }
    }

    return (
        <>
            <JourneyLocationBase
                index={index}
                position={position}
                bgUrl={BG_URL}
                fgUrl={FG_URL}
                disableBobbing={true}
                fgChildren={
                    isActive && (
                        <HitZone 
                            id="cauldron_brew"
                            initialX={0.032}
                            initialY={-0.225}
                            initialW={0.174}
                            initialH={0.261}
                            onPointerDown={handleCauldronDown}
                            onPointerUp={cancelBrew}
                            onPointerOut={cancelBrew}
                        />
                    )
                }
            />

            {/* Cauldron sparkle effects only – no 3D ingredients */}
            {isActive && (
                <group position={position}>
                    <group position={[0, -3.5, 2]}>
                        {gameState === 'brewing' && (
                            <Sparkles count={50} scale={5} size={6} speed={2} color="#88ff88" opacity={0.8} />
                        )}
                        {gameState === 'success' && (
                            <Sparkles count={200} scale={8} size={15} speed={4} color="#00ff00" opacity={1} />
                        )}
                        {gameState === 'failure' && (
                            <Sparkles count={200} scale={8} size={15} speed={0.5} color="#ff0000" opacity={1} noise={2} />
                        )}
                    </group>
                </group>
            )}
        </>
    )
}
