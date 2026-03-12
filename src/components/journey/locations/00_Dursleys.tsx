'use client'

import { useState, useRef } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '@/lib/store'
import { usePuzzleLocationIndex } from '@/hooks/use-puzzle-scroll'
import { useFrame } from '@react-three/fiber'

// A single flying letter component
function FlyingLetter({
    id,
    onCatch,
    isCaught
}: {
    id: number,
    onCatch: () => void,
    isCaught: boolean
}) {
    const groupRef = useRef<THREE.Group>(null)
    const [speedX] = useState((Math.random() - 0.5) * 5)
    const [speedY] = useState(2 + Math.random() * 3)

    // Reset loop
    useFrame((state, delta) => {
        if (!groupRef.current) return
        if (isCaught) return // stop moving if puzzle solved

        groupRef.current.position.y += speedY * delta
        groupRef.current.position.x += speedX * delta

        // Add some chaotic rotation
        groupRef.current.rotation.z += delta * 2
        groupRef.current.rotation.x += delta

        // If it goes too high out of frame, reset to fireplace
        if (groupRef.current.position.y > 6) {
            groupRef.current.position.set(0, -1, 0)
        }
    })

    return (
        <group ref={groupRef} position={[0, -1, 0]}>
            <Html center zIndexRange={[100, 0]}>
                <div
                    onClick={onCatch}
                    style={{
                        background: '#f4e4bc',
                        padding: '10px 15px',
                        border: '1px solid #c8a165',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                        cursor: 'pointer',
                        transform: 'rotate(-10deg)',
                        userSelect: 'none',
                        width: '120px',
                        textAlign: 'center',
                        pointerEvents: isCaught ? 'none' : 'auto',
                        opacity: isCaught ? 0 : 1, // Hide when solved
                        transition: 'opacity 0.5s'
                    }}
                >
                    <div style={{
                        border: '1px solid #d4b581',
                        padding: '5px',
                        color: '#8b0000',
                        fontFamily: "'Cinzel', serif",
                        fontSize: '10px',
                        fontWeight: 'bold'
                    }}>
                        Hogwarts
                        <div style={{ height: '3px', background: '#d4b581', margin: '4px 0' }}></div>
                        <span style={{ color: '#222' }}>Mr. H. Potter</span>
                    </div>
                </div>
            </Html>
        </group>
    )
}

export function Dursleys({ position = [0, 0, 30] }: { position?: [number, number, number] }) {
    const locationIndex = usePuzzleLocationIndex()
    const { maxUnlockedIndex, unlockNextPuzzle } = useStore()

    const isVisible = locationIndex < 0.9
    const [isSolved, setIsSolved] = useState(maxUnlockedIndex > 0)

    const handleLetterCatch = () => {
        if (!isSolved) {
            setIsSolved(true)
            unlockNextPuzzle()
        }
    }

    return (
        <group position={new THREE.Vector3(...position)}>
            {/* The Cupboard Under the Stairs (Basic Geometry) */}
            <mesh position={[0, 0, -2]} castShadow receiveShadow>
                <boxGeometry args={[8, 5, 4]} />
                <meshStandardMaterial color="#2a2420" roughness={0.9} />
            </mesh>

            {/* Fireplace representing where letters come from */}
            <mesh position={[0, -1.5, -0.1]}>
                <planeGeometry args={[2, 2]} />
                <meshStandardMaterial color="#050302" />
            </mesh>

            <pointLight position={[0, -1.5, 0.5]} intensity={1.5} color="#ffaa00" />

            {/* Glowing Dust Particles */}
            <points position={[0, 0, 1]}>
                <sphereGeometry args={[2, 16, 16]} />
                <pointsMaterial size={0.05} color="#ffd700" transparent opacity={0.2} />
            </points>

            {/* The Puzzle Overlay */}
            {isVisible && (
                <Html position={[0, 2.5, 0]} center distanceFactor={15} zIndexRange={[100, 0]}>
                    <div style={{
                        color: '#e8f4ff',
                        fontFamily: "'Cinzel', serif",
                        textAlign: 'center',
                        textShadow: '0 0 10px rgba(0,0,0,0.8)',
                        width: '450px',
                        background: 'rgba(0,0,0,0.4)',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>4 Privet Drive</h2>
                        <p style={{ fontSize: '1rem', opacity: 0.9, fontFamily: 'sans-serif' }}>
                            {isSolved
                                ? "✨ You caught your letter! Scroll down to continue the journey."
                                : "The Dursleys won't let you read your mail! Letters are flying out of the fireplace—catch one before it burns!"}
                        </p>
                    </div>
                </Html>
            )}

            {/* The Flying Letters (Render 5 active letters at once) */}
            {isVisible && !isSolved && Array.from({ length: 5 }).map((_, i) => (
                <FlyingLetter
                    key={i}
                    id={i}
                    onCatch={handleLetterCatch}
                    isCaught={isSolved}
                />
            ))}

            {/* Success Letter fixed in the center when solved */}
            {isVisible && isSolved && (
                <Html position={[0, 0, 1]} center distanceFactor={10} zIndexRange={[200, 0]}>
                    <div style={{
                        background: '#f4e4bc',
                        padding: '20px 30px',
                        border: '1px solid #c8a165',
                        boxShadow: '0 0 30px rgba(255, 215, 0, 0.4)',
                        color: '#2a1a0f',
                        fontFamily: "'Cinzel', serif",
                        textAlign: 'center',
                        animation: 'fadeInScale 0.5s ease-out'
                    }}>
                        <h3 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #d4b581', paddingBottom: '10px', color: '#8b0000' }}>
                            HOGWARTS SCHOOL<br />
                            <span style={{ fontSize: '0.6em' }}>of WITCHCRAFT and WIZARDRY</span>
                        </h3>
                        <p style={{ fontSize: '0.9em' }}>
                            Dear Mr. Potter,<br />
                            We are pleased to inform you that you have been accepted at Hogwarts.
                        </p>
                    </div>
                </Html>
            )}
        </group>
    )
}
