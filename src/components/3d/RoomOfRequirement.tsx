'use client'

import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'
import * as THREE from 'three'

interface LocationProps {
    position: [number, number, number]
}

export function RoomOfRequirement({ position }: LocationProps) {
    const [isRevealed, setIsRevealed] = useState(false)
    const [isInside, setIsInside] = useState(false)
    const shiftPresses = useRef<number[]>([])
    const { camera } = useThree()
    const posVec = useRef(new THREE.Vector3(...position))
    const [opacity, setOpacity] = useState(0)

    // Listen for Shift key presses
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Shift') {
                const now = Date.now()
                shiftPresses.current.push(now)

                // Keep only presses within the last 2 seconds
                shiftPresses.current = shiftPresses.current.filter(time => now - time < 2000)

                // Trigger reveal if 3 presses in quick succession
                if (shiftPresses.current.length >= 3 && !isRevealed) {
                    setIsRevealed(true)
                    shiftPresses.current = [] // reset
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isRevealed])

    useFrame(() => {
        const dist = camera.position.distanceTo(posVec.current)
        const raw = 1 - THREE.MathUtils.clamp((dist - 8) / (18 - 8), 0, 1)
        const next = Math.round(raw * 100) / 100
        setOpacity(prev => Math.abs(next - prev) > 0.02 ? next : prev)
    })

    useEffect(() => {
        if (opacity < 0.3 && isInside) {
            setIsInside(false)
        }
    }, [opacity, isInside])

    // If we are too far, don't render the heavy portal content at all to save performance
    if (opacity <= 0) return null

    return (
        <group position={position}>
            {/* The invisible wall area where the room reveals itself */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[4, 5, 0.1]} />
                <meshStandardMaterial color="#111" transparent opacity={0.3} depthWrite={false} />
            </mesh>

            {/* Revealed Doorway */}
            {isRevealed && !isInside && (
                <group>
                    {/* Glowing Archway */}
                    <mesh position={[0, 0, 0.1]}>
                        <torusGeometry args={[2, 0.15, 16, 100, Math.PI]} />
                        <meshStandardMaterial color="#fffde7" emissive="#fffde7" emissiveIntensity={2} />
                    </mesh>
                    <pointLight color="#fffde7" intensity={2} distance={10} position={[0, 2, 1]} />

                    <Html position={[0, 0, 0.2]} center style={{ pointerEvents: 'auto' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            transition={{ duration: 2, ease: "easeOut" }}
                            className="glass"
                            style={{ padding: '2rem', textAlign: 'center', cursor: 'pointer', border: '1px solid #fffde7', boxShadow: '0 0 20px rgba(255, 253, 231, 0.3)' }}
                            onClick={() => setIsInside(true)}
                        >
                            <h2 className="heading-magic" style={{ margin: 0, textShadow: '0 0 10px #fff' }}>Enter</h2>
                            <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', opacity: 0.8 }}>The Room is ready.</p>
                        </motion.div>
                    </Html>
                </group>
            )}

            {/* Placeholder HUD hint if NOT revealed yet */}
            {!isRevealed && (
                <Html position={[0, -2, 0]} center style={{ opacity: opacity * 0.5, pointerEvents: 'none' }}>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: '#aaa', fontStyle: 'italic', whiteSpace: 'nowrap' }}>
                        Pace back and forth three times... (Press Shift 3x)
                    </p>
                </Html>
            )}

            {/* Inside the Room Overlay */}
            <Html zIndexRange={[300, 200]} center>
                <AnimatePresence>
                    {isInside && (
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 50 }}
                            className="glass"
                            style={{
                                width: '80vw',
                                height: '70vh',
                                maxWidth: '800px',
                                padding: '2rem',
                                display: 'flex',
                                flexDirection: 'column',
                                pointerEvents: 'auto',
                                border: '1px solid rgba(255, 253, 231, 0.5)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 className="heading-magic" style={{ margin: 0, fontSize: '2rem' }}>Archive of Ideas</h2>
                                <button
                                    onClick={() => setIsInside(false)}
                                    style={{ background: 'transparent', border: '1px solid #fff', color: '#fff', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Close
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', flex: 1, overflowY: 'auto' }}>
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px' }}>
                                    <h3 style={{ fontFamily: "'Cinzel', serif", marginTop: 0, color: '#f3e5f5' }}>Plot Hooks</h3>
                                    <ul style={{ paddingLeft: '1.2rem', color: '#e0e0e0', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                        <li>The cursed amulet in the restricted section.</li>
                                        <li>Mermaids demanding tribute at the lake.</li>
                                        <li>A clocktower that strikes 13.</li>
                                    </ul>
                                </div>
                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px' }}>
                                    <h3 style={{ fontFamily: "'Cinzel', serif", marginTop: 0, color: '#e8f5e9' }}>Yearly Achievements</h3>
                                    <ul style={{ paddingLeft: '1.2rem', color: '#e0e0e0', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                        <li>Mastered Advanced React Patterns.</li>
                                        <li>Deployed 5 successful projects.</li>
                                        <li>Read 20 books.</li>
                                    </ul>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Html>
        </group>
    )
}
