'use client'

import { useRef, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

interface LocationProps {
    position: [number, number, number]
}

export function DynamicStaircases({ position }: LocationProps) {
    const groupRef = useRef<THREE.Group>(null)
    const { camera } = useThree()
    const [opacity, setOpacity] = useState(0)
    const posVec = useRef(new THREE.Vector3(...position))

    // Generate random staircases
    const stairs = useMemo(() => {
        return Array.from({ length: 8 }).map((_, i) => ({
            id: i,
            x: (Math.random() - 0.5) * 8,
            y: (Math.random() - 0.5) * 6,
            z: (Math.random() - 0.5) * 4,
            rotationSpeed: (Math.random() - 0.5) * 0.5,
            targetRotation: 0,
        }))
    }, [])

    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        const dist = camera.position.distanceTo(posVec.current)
        const raw = 1 - THREE.MathUtils.clamp((dist - 8) / (18 - 8), 0, 1)
        const next = Math.round(raw * 100) / 100
        setOpacity(prev => Math.abs(next - prev) > 0.02 ? next : prev)

        // Gentle floating for the whole group
        if (groupRef.current) {
            groupRef.current.position.y = position[1] + Math.sin(t * 0.5) * 0.3
        }
    })

    return (
        <group ref={groupRef} position={position}>
            {stairs.map((stair, i) => (
                <Staircase key={stair.id} data={stair} />
            ))}

            {/* A single central portrait as an example */}
            <Html position={[0, 2, 0]} center style={{ opacity, transition: 'opacity 0.3s', pointerEvents: opacity > 0.3 ? 'auto' : 'none' }}>
                <div className="glass" style={{ padding: '0.5rem', width: '120px', textAlign: 'center', border: '2px solid #b89947' }}>
                    <div style={{ width: '100%', height: '140px', background: '#222', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        🖼️
                    </div>
                    <p style={{ margin: 0, fontSize: '0.65rem', fontStyle: 'italic', color: '#fff9c4' }}>
                        "Mind your step! They like to change."
                    </p>
                </div>
            </Html>

            <Html position={[0, -3, 0]} center style={{ opacity, pointerEvents: 'none', transition: 'opacity 0.3s' }}>
                <div style={{ color: '#d4af37', fontFamily: "'Cinzel', serif", fontSize: '1.2rem', textShadow: '0 0 10px #d4af37' }}>
                    The Grand Staircase
                </div>
            </Html>
        </group>
    )
}

function Staircase({ data }: { data: any }) {
    const meshRef = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (!meshRef.current) return
        const t = state.clock.getElapsedTime()
        // Snap rotation every 4 seconds to simulate "changing direction"
        const cycle = Math.floor(t / 4)
        const targetY = (cycle % 4) * (Math.PI / 2) // Rotate by 90 degrees

        // Smooth lerp to the target rotation
        meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, targetY, 0.05)
    })

    return (
        <group ref={meshRef} position={[data.x, data.y, data.z]}>
            {/* Build a mini staircase out of 4 steps */}
            {[0, 1, 2, 3].map(step => (
                <mesh key={step} position={[0, step * 0.3, step * 0.4]} castShadow receiveShadow>
                    <boxGeometry args={[1.5, 0.1, 0.4]} />
                    <meshStandardMaterial color="#4a4238" roughness={0.9} />
                </mesh>
            ))}
        </group>
    )
}
