'use client'

import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useLocationIndex } from '@/hooks/use-scroll-progress'

export function QuidditchArena({ position = [0, -2, -210] }: { position?: [number, number, number] }) {
    const groupRef = useRef<THREE.Group>(null)
    const snitchRef = useRef<THREE.Group>(null)
    const wingsRef = useRef<THREE.Group>(null)
    const progressBarRef = useRef<HTMLDivElement>(null)

    type Difficulty = 'easy' | 'medium' | 'hard'
    const [difficulty, setDifficulty] = useState<Difficulty>('hard')
    const [isCaught, setIsCaught] = useState(false)
    const hoverTimeRef = useRef(0)
    const isHoveredRef = useRef(false)

    const locationIndex = useLocationIndex()
    // 9th location (index 8)
    const isVisible = Math.abs(locationIndex - 8) < 0.8

    useFrame((state, delta) => {
        if (!isVisible) return

        const time = state.clock.getElapsedTime()

        // Snitch Movement Logic
        if (snitchRef.current) {
            if (!isCaught) {
                // Apply speed multiplier based on difficulty
                const speedMultiplier = difficulty === 'hard' ? 1
                    : difficulty === 'medium' ? 0.5
                        : 0.33

                const t = time * speedMultiplier

                // Erratic movement using sine waves with different frequencies and phases
                // Restored to tournament speeds!
                const x = Math.sin(t * 2.1) * 3 + Math.sin(t * 3.5) * 1.5
                const y = Math.cos(t * 1.8) * 2 + Math.sin(t * 4.2) * 1 + 2 // Base height = 2
                const z = Math.sin(t * 2.5) * 2

                // Smoothly interpolate towards the target position
                snitchRef.current.position.lerp(new THREE.Vector3(x, y, z), 0.1)

                // Rapid wing flapping
                if (wingsRef.current) {
                    wingsRef.current.children.forEach((wing, index) => {
                        const flapSpeed = 40
                        // Alternate left and right wing flap directions
                        const direction = index === 0 ? 1 : -1
                        wing.rotation.z = Math.sin(time * flapSpeed) * 0.8 * direction
                    })
                }

                // Catching Logic
                if (isHoveredRef.current) {
                    hoverTimeRef.current += delta
                    // Scale up the snitch slightly as you get closer to catching it
                    const scale = 1 + (hoverTimeRef.current / 2) * 0.5
                    snitchRef.current.scale.setScalar(scale)

                    if (progressBarRef.current) {
                        progressBarRef.current.style.width = `${(hoverTimeRef.current / 2.0) * 100}%`
                    }

                    if (hoverTimeRef.current >= 2.0) { // 2 seconds to catch
                        setIsCaught(true)
                    }
                } else {
                    hoverTimeRef.current = Math.max(0, hoverTimeRef.current - delta * 2) // Decay hover time
                    snitchRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1)

                    if (progressBarRef.current) {
                        progressBarRef.current.style.width = `${(hoverTimeRef.current / 2.0) * 100}%`
                    }
                }

            } else {
                // Caught state: Float gently in the center
                snitchRef.current.position.lerp(new THREE.Vector3(0, 2, 0), 0.05)
                snitchRef.current.scale.lerp(new THREE.Vector3(2, 2, 2), 0.05) // Emphasize it

                // Slow down wings
                if (wingsRef.current) {
                    wingsRef.current.children.forEach((wing) => {
                        wing.rotation.z += (0 - wing.rotation.z) * 0.1
                    })
                }
            }
        }
    })

    return (
        <group position={new THREE.Vector3(...position)} ref={groupRef}>
            {/* The Pitch Grass */}
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[15, 64]} />
                <meshStandardMaterial color="#2d4c1e" roughness={0.9} />
            </mesh>

            {/* Goal Hoops */}
            {[-1, 0, 1].map((offset, i) => (
                <group key={i} position={[offset * 4, 0, 0]}>
                    <mesh castShadow position={[0, Math.abs(offset) === 1 ? 3 : 5, 0]}>
                        <cylinderGeometry args={[0.1, 0.1, Math.abs(offset) === 1 ? 6 : 10]} />
                        <meshStandardMaterial color="#8b5a2b" />
                    </mesh>
                    <mesh castShadow position={[0, Math.abs(offset) === 1 ? 6 : 10, 0]} rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[0.8, 0.1, 16, 32]} />
                        <meshStandardMaterial color="#d4af37" metalness={0.6} roughness={0.2} />
                    </mesh>
                </group>
            ))}

            {/* Golden Snitch */}
            <group
                ref={snitchRef}
                onPointerOver={() => {
                    if (isVisible && !isCaught) {
                        isHoveredRef.current = true
                        document.body.style.cursor = 'crosshair'
                    }
                }}
                onPointerOut={() => {
                    if (isVisible && !isCaught) {
                        isHoveredRef.current = false
                        document.body.style.cursor = 'auto'
                    }
                }}
            >
                {/* Invisible Hitbox (doubles the catch radius) */}
                <mesh visible={false}>
                    <sphereGeometry args={[0.3, 16, 16]} />
                    <meshBasicMaterial transparent opacity={0} />
                </mesh>

                {/* Snitch Body */}
                <mesh castShadow>
                    <sphereGeometry args={[0.15, 32, 32]} />
                    <meshStandardMaterial
                        color={isCaught ? "#ffea00" : "#d4af37"}
                        metalness={0.8}
                        roughness={0.1}
                        emissive="#d4af37"
                        emissiveIntensity={isHoveredRef.current ? 0.5 : 0.2}
                    />
                </mesh>

                {/* Wings */}
                <group ref={wingsRef}>
                    {/* Left Wing */}
                    <mesh position={[-0.15, 0, 0]}>
                        <planeGeometry args={[0.6, 0.2]} />
                        <meshStandardMaterial color="#ffffff" transparent opacity={0.6} side={THREE.DoubleSide} />
                    </mesh>
                    {/* Right Wing */}
                    <mesh position={[0.15, 0, 0]}>
                        <planeGeometry args={[0.6, 0.2]} />
                        <meshStandardMaterial color="#ffffff" transparent opacity={0.6} side={THREE.DoubleSide} />
                    </mesh>
                </group>
            </group>

            {/* Ambient Lighting for Pitch */}
            <ambientLight intensity={0.4} />
            <directionalLight position={[10, 15, -10]} intensity={1.5} color="#fffcf5" castShadow />

            {/* UI Overlay */}
            {isVisible && (
                <Html position={[0, 4, 0]} center distanceFactor={15} zIndexRange={[100, 0]}>
                    <div style={{
                        color: isCaught ? '#ffea00' : '#ffffff',
                        fontFamily: "'Cinzel', serif",
                        fontSize: '1.5rem',
                        textShadow: '0 0 10px rgba(0,0,0,0.8)',
                        pointerEvents: 'none',
                        userSelect: 'none',
                        textAlign: 'center',
                        background: 'rgba(0,0,0,0.4)',
                        padding: '1rem 2rem',
                        borderRadius: '8px',
                        backdropFilter: 'blur(4px)',
                        border: `1px solid ${isCaught ? '#ffea00' : 'rgba(255,255,255,0.2)'}`
                    }}>
                        {isCaught ? "150 Points! Snitch Caught!" : "The Quidditch Pitch"}
                        <div style={{
                            fontSize: '0.8rem',
                            opacity: 0.8,
                            marginTop: '8px',
                            fontFamily: 'sans-serif',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            {isCaught ? "Victory!" : "Hover the cursor over the Golden Snitch to catch it!"}
                        </div>

                        {isCaught && (
                            <div style={{ pointerEvents: 'auto', marginTop: '15px' }}>
                                <button
                                    onClick={() => {
                                        setIsCaught(false)
                                        hoverTimeRef.current = 0
                                        isHoveredRef.current = false
                                        if (progressBarRef.current) {
                                            progressBarRef.current.style.width = '0%'
                                        }
                                    }}
                                    style={{
                                        background: 'rgba(212, 175, 55, 0.4)',
                                        border: '1px solid #d4af37',
                                        color: '#d4af37',
                                        padding: '8px 16px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        textTransform: 'uppercase',
                                        fontFamily: 'sans-serif',
                                        transition: 'background 0.2s',
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.6)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(212, 175, 55, 0.4)'}
                                >
                                    Play Again
                                </button>
                            </div>
                        )}

                        {!isCaught && (
                            <>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    marginTop: '15px',
                                    pointerEvents: 'auto'
                                }}>
                                    {(['easy', 'medium', 'hard'] as Difficulty[]).map(level => (
                                        <button
                                            key={level}
                                            onClick={() => setDifficulty(level)}
                                            style={{
                                                background: difficulty === level ? 'rgba(212, 175, 55, 0.4)' : 'transparent',
                                                border: `1px solid ${difficulty === level ? '#d4af37' : 'rgba(255,255,255,0.3)'}`,
                                                color: difficulty === level ? '#d4af37' : 'white',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '0.7rem',
                                                textTransform: 'uppercase',
                                                fontFamily: 'sans-serif'
                                            }}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>

                                <div style={{
                                    width: '100%',
                                    height: '4px',
                                    background: 'rgba(255,255,255,0.2)',
                                    marginTop: '15px',
                                    borderRadius: '2px',
                                    overflow: 'hidden'
                                }}>
                                    <div ref={progressBarRef} style={{
                                        height: '100%',
                                        background: '#d4af37',
                                        width: '0%', // Updated via useFrame ref
                                        transition: 'background 0.2s linear'
                                    }} />
                                </div>
                            </>
                        )}
                    </div>
                </Html>
            )}
        </group>
    )
}
