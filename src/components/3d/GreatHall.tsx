'use client'

import { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'
import * as THREE from 'three'

interface LocationProps {
    position: [number, number, number]
}

export function GreatHall({ position }: LocationProps) {
    const meshRef = useRef<THREE.Mesh>(null)
    const { camera } = useThree()
    const [opacity, setOpacity] = useState(0)
    const posVec = useRef(new THREE.Vector3(...position))

    useFrame(() => {
        if (meshRef.current) meshRef.current.rotation.y += 0.005

        const dist = camera.position.distanceTo(posVec.current)
        const raw = 1 - THREE.MathUtils.clamp((dist - 8) / (18 - 8), 0, 1)
        const next = Math.round(raw * 100) / 100
        setOpacity(prev => Math.abs(next - prev) > 0.02 ? next : prev)
    })

    return (
        <group position={position}>
            <mesh ref={meshRef} position={[0, 1, 0]}>
                <octahedronGeometry args={[1.5, 0]} />
                <meshStandardMaterial color="#ffcc00" emissive="#ffcc00" emissiveIntensity={0.4 * opacity} wireframe />
            </mesh>

            {/* Floating candle lights */}
            <pointLight position={[0, 3, 0]} intensity={2 * opacity} color="#ffdd55" distance={8} />

            <Html
                position={[0, -1.5, 0]}
                center
                style={{ opacity, pointerEvents: opacity > 0.5 ? 'auto' : 'none', transition: 'opacity 0.3s' }}
            >
                <div className="glass" style={{ padding: '1rem', width: '240px', textAlign: 'center', cursor: 'pointer' }}
                    onClick={() => alert('Welcome to The Great Hall!')}>
                    <h2 className="heading-magic" style={{ fontSize: '1.1rem', margin: 0 }}>The Great Hall</h2>
                    <p style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: '4px' }}>Gather for the feast.</p>
                </div>
            </Html>
        </group>
    )
}
