'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useLocationIndex } from '@/hooks/use-scroll-progress'
import { useStore } from '@/lib/store'

export function CatCorner({ position = [0, -2, -180] }: { position?: [number, number, number] }) {
    const groupRef = useRef<THREE.Group>(null)
    const tailRef = useRef<THREE.Mesh>(null)
    const [isFed, setIsFed] = useState(false)
    const [hovered, setHovered] = useState(false)

    const locationIndex = useLocationIndex()
    const { isLumosActive } = useStore()

    // 8th location (index 7)
    const isVisible = Math.abs(locationIndex - 7) < 0.8

    useFrame((state) => {
        if (!isVisible) return

        const time = state.clock.getElapsedTime()

        // Idle animation: breathing
        if (groupRef.current) {
            groupRef.current.scale.y = 1 + Math.sin(time * 3) * 0.02
        }

        // Tail swish
        if (tailRef.current) {
            const speed = isFed ? 8 : 4
            const range = isFed ? 0.6 : 0.3
            tailRef.current.rotation.z = Math.sin(time * speed) * range
        }
    })

    const handleFeed = () => {
        if (!isFed) {
            setIsFed(true)
            // Reset after 10 seconds
            setTimeout(() => setIsFed(false), 10000)
        }
    }

    // Colors change if Transfiguration (Lumos for now) is active
    const catColor = isLumosActive ? "#ffaa00" : "#222222"
    const catEmissive = isLumosActive ? "#552200" : "#000000"

    return (
        <group position={new THREE.Vector3(...position)} ref={groupRef}>
            {/* Courtyard Base */}
            <mesh position={[0, 0, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[4, 4, 0.2, 32]} />
                <meshStandardMaterial color="#3a404a" roughness={0.9} />
            </mesh>

            {/* Pedestal */}
            <mesh position={[0, 0.6, 0]} receiveShadow castShadow>
                <boxGeometry args={[1.5, 1, 1.5]} />
                <meshStandardMaterial color="#4a505a" roughness={0.8} />
            </mesh>

            {/* The Cat (Blocky stylized) */}
            <group position={[0, 1.4, 0]}>
                {/* Body */}
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[0.8, 0.6, 1.2]} />
                    <meshStandardMaterial color={catColor} emissive={catEmissive} roughness={0.5} />
                </mesh>

                {/* Head */}
                <mesh position={[0, 0.4, 0.5]} castShadow receiveShadow>
                    <boxGeometry args={[0.5, 0.5, 0.5]} />
                    <meshStandardMaterial color={catColor} emissive={catEmissive} roughness={0.5} />
                </mesh>

                {/* Ears */}
                <mesh position={[-0.2, 0.7, 0.6]} castShadow>
                    <coneGeometry args={[0.1, 0.3, 4]} />
                    <meshStandardMaterial color={catColor} emissive={catEmissive} roughness={0.5} />
                </mesh>
                <mesh position={[0.2, 0.7, 0.6]} castShadow>
                    <coneGeometry args={[0.1, 0.3, 4]} />
                    <meshStandardMaterial color={catColor} emissive={catEmissive} roughness={0.5} />
                </mesh>

                {/* Tail */}
                <group position={[0, 0.2, -0.6]} ref={tailRef}>
                    <mesh position={[0, 0, -0.4]} castShadow>
                        <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
                        <meshStandardMaterial color={catColor} emissive={catEmissive} roughness={0.5} />
                    </mesh>
                </group>
            </group>

            {/* Treat Box (Click to feed) */}
            <mesh
                position={[1.2, 0.2, 1]}
                castShadow
                receiveShadow
                onClick={() => isVisible && handleFeed()}
                onPointerOver={() => {
                    if (isVisible) {
                        setHovered(true)
                        document.body.style.cursor = 'pointer'
                    }
                }}
                onPointerOut={() => {
                    if (isVisible) {
                        setHovered(false)
                        document.body.style.cursor = 'auto'
                    }
                }}
            >
                <boxGeometry args={[0.4, 0.4, 0.4]} />
                <meshStandardMaterial color="#884422" roughness={0.7} />

                {hovered && isVisible && (
                    <Html position={[0, 0.5, 0]} center>
                        <div style={{
                            background: 'rgba(0,0,0,0.8)',
                            color: '#fff',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            pointerEvents: 'none',
                            whiteSpace: 'nowrap'
                        }}>
                            Click to Feed Kneazle
                        </div>
                    </Html>
                )}
            </mesh>

            {/* Title */}
            {isVisible && (
                <Html position={[0, 4, 0]} center distanceFactor={15}>
                    <div style={{
                        color: '#aaddbb',
                        fontFamily: "'Cinzel', serif",
                        fontSize: '1.2rem',
                        textShadow: '0 0 10px #aaddbb',
                        pointerEvents: 'none',
                        userSelect: 'none',
                        textAlign: 'center'
                    }}>
                        The Courtyard
                        <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '4px' }}>
                            {isFed ? "The Kneazle is happy!" : "The Kneazle looks hungry..."}
                        </div>
                    </div>
                </Html>
            )}

            {/* Lights */}
            <pointLight position={[0, 3, 0]} intensity={isFed ? 1.5 : 0.8} color={isFed ? "#ffaa00" : "#aaddbb"} distance={10} />
        </group>
    )
}
