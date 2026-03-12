'use client'

import { useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { JourneyLayer, preloadJourneyLocation } from './JourneyLocationBase'
import { HitZone } from '../HitZone'
import { useHagridsHutStore, HUT_ITEMS } from '@/hooks/use-hagrids-hut'
import { usePuzzleLocationIndex } from '@/hooks/use-puzzle-scroll'
import { useRef } from 'react'
import * as THREE from 'three'
import { useStore } from '@/lib/store'

const BG_URL = '/textures/journey/hagrids-hut/background.webp'

preloadJourneyLocation(BG_URL)

interface HagridsHutProps {
    position?: [number, number, number]
    index?: number
}

export function HagridsHut({ position = [0, 0, 0], index = 9 }: HagridsHutProps) {
    const locationIndex = usePuzzleLocationIndex()
    const { setIsActive, handleClick, phase } = useHagridsHutStore()
    const { maxUnlockedIndex, unlockNextPuzzle, markJourneyCompleted } = useStore()

    const isOnLocation = Math.round(locationIndex) === index

    useEffect(() => {
        setIsActive(isOnLocation)
    }, [isOnLocation, setIsActive])

    useEffect(() => {
        if (!isOnLocation) return
        if (phase !== 'won') return
        markJourneyCompleted('hagrids_hut')
        if (maxUnlockedIndex === index) unlockNextPuzzle()
    }, [isOnLocation, phase, maxUnlockedIndex, index, unlockNextPuzzle, markJourneyCompleted])

    const groupRef = useRef<THREE.Group>(null)
    const focusedCameraZ = 68 - index * 30
    const groupZ = position[2]

    const dist = Math.abs(locationIndex - index)
    const targetOpacity = dist < 0.6 ? 1 - dist / 0.6 : 0

    useFrame(() => {
        if (!groupRef.current) return
        groupRef.current.visible = targetOpacity > 0.01 || dist < 1.0
    })

    if (dist >= 1.0 && targetOpacity <= 0.01) return null

    return (
        <group ref={groupRef} position={position}>
            {/* Single background layer — no foreground */}
            <JourneyLayer
                textureUrl={BG_URL}
                localZ={-15}
                opacity={targetOpacity}
                focusedCameraZ={focusedCameraZ}
                groupZ={groupZ}
                sizeMultiplier={1.0}
            >
                {/* Hit zones for all 8 objects, only active during gameplay */}
                {isOnLocation && phase === 'playing' && HUT_ITEMS.map(item => (
                    <HitZone
                        key={item.id}
                        id={`hut_${item.id}`}
                        initialX={item.hitX}
                        initialY={item.hitY}
                        initialW={item.hitW}
                        initialH={item.hitH}
                        onPointerDown={(e) => {
                            e.stopPropagation()
                            handleClick(item.id)
                        }}
                    />
                ))}
            </JourneyLayer>
        </group>
    )
}
