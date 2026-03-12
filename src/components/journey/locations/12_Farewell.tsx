'use client'

import { Text } from '@react-three/drei'
import { JourneyLocationBase, preloadJourneyLocation } from './JourneyLocationBase'

interface FarewellProps {
    position?: [number, number, number]
    index?: number
}

// Placeholder background for now (we can swap this to a dedicated photo later).
const BG_URL = '/textures/journey/library/bg.webp'
preloadJourneyLocation(BG_URL)

export function FarewellLocation({ position = [0, 0, 0], index = 13 }: FarewellProps) {
    return (
        <JourneyLocationBase
            index={index}
            position={position}
            bgUrl={BG_URL}
            bobbingMode="y"
        >
            {/* Centered closing note */}
            <group position={[0, 0, 0.2]}>
                <Text
                    position={[0, 0, 0.001]}
                    maxWidth={0.85}
                    fontSize={0.065}
                    lineHeight={1.25}
                    whiteSpace="normal"
                    overflowWrap="break-word"
                    textAlign="center"
                    anchorX="center"
                    anchorY="middle"
                    color="#fff8e1"
                    fillOpacity={0.95}
                    outlineWidth={0.004}
                    outlineColor="#000000"
                    outlineOpacity={0.35}
                >
                    {'Hope the adventure was pleasant.\nSee you again at Hogwarts!'}
                </Text>
            </group>
        </JourneyLocationBase>
    )
}

