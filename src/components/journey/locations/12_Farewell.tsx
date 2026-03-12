'use client'

import { Text } from '@react-three/drei'
import { JourneyLocationBase, preloadJourneyLocation } from './JourneyLocationBase'
import { withBasePath } from '@/lib/base-path'

interface FarewellProps {
    position?: [number, number, number]
    index?: number
}

const BG_URL = '/textures/journey/farewell/background.webp'
const FG_URL = '/textures/journey/farewell/foreground.webp'
const FONT_URL = withBasePath('/fonts/Cinzel.ttf')

preloadJourneyLocation(BG_URL, FG_URL)

export function FarewellLocation({ position = [0, 0, 0], index = 13 }: FarewellProps) {
    return (
        <JourneyLocationBase
            index={index}
            position={position}
            bgUrl={BG_URL}
            fgUrl={FG_URL}
            bobbingMode="z"
        >
            {/* Text sits between BG and FG (so it won't cover the heroes). */}
            <group position={[0, 0, 0.02]}>
                {/* Text is authored in normalized [-0.5..0.5] space (JourneyLayer scales it). */}
                <Text
                    font={FONT_URL}
                    position={[0, 0.16, 0.001]}
                    maxWidth={0.7}
                    fontSize={0.07}
                    lineHeight={1.15}
                    whiteSpace="normal"
                    overflowWrap="break-word"
                    textAlign="center"
                    anchorX="center"
                    anchorY="middle"
                    color="#fff8e1"
                    fillOpacity={0.95}
                    outlineWidth={0.0025}
                    outlineColor="#000000"
                    outlineOpacity={0.75}
                >
                    {'Until we meet again at Hogwarts'}
                </Text>
            </group>
        </JourneyLocationBase>
    )
}
