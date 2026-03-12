'use client'

import { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'
import * as THREE from 'three'
import { Gryffindor } from './rooms/Gryffindor'
import { Slytherin } from './rooms/Slytherin'
import { Ravenclaw } from './rooms/Ravenclaw'
import { Hufflepuff } from './rooms/Hufflepuff'

interface LocationProps {
    position: [number, number, number]
}

export function CommonRooms({ position }: LocationProps) {
    const groupRef = useRef<THREE.Group>(null)
    const { camera } = useThree()
    const [opacity, setOpacity] = useState(0)
    const posVec = useRef(new THREE.Vector3(...position))

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime()) * 0.2
        }

        const dist = camera.position.distanceTo(posVec.current)
        const raw = 1 - THREE.MathUtils.clamp((dist - 8) / (18 - 8), 0, 1)
        const next = Math.round(raw * 100) / 100
        setOpacity(prev => Math.abs(next - prev) > 0.02 ? next : prev)
    })

    return (
        <group ref={groupRef} position={position}>
            {/* Individual faculty rooms - each has its own click handler */}
            <Gryffindor />
            <Slytherin />
            <Ravenclaw />
            <Hufflepuff />

            {/* Location header label — fades based on camera proximity */}
            <Html
                position={[0, -2.5, 0]}
                center
                style={{ opacity, pointerEvents: 'none', transition: 'opacity 0.3s' }}
            >
                <div className="glass" style={{ padding: '0.75rem 1.5rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <h2 className="heading-magic" style={{ fontSize: '1rem', margin: 0 }}>Common Rooms</h2>
                    <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '3px' }}>Find your house door ↑</p>
                </div>
            </Html>
        </group>
    )
}
