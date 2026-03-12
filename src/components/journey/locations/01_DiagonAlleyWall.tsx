'use client'

import { useState } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '@/lib/store'
import { usePuzzleLocationIndex } from '@/hooks/use-puzzle-scroll'
import { motion } from 'framer-motion'
import { Suspense } from 'react'

export function DiagonAlleyWall({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
    const locationIndex = usePuzzleLocationIndex()
    const { maxUnlockedIndex, unlockNextPuzzle } = useStore()

    // In our rig, Diagon Alley is at index 1
    const isVisible = Math.abs(locationIndex - 1) < 0.9
    const [isSolved, setIsSolved] = useState(maxUnlockedIndex > 1)

    // State to track failed attempts for visual feedback (shake)
    const [failedAttempt, setFailedAttempt] = useState(false)

    // The Grid: Let's make a grid of 10x6 bricks.
    // The "trash can" is visually located near the bottom left.
    // Let's say Trash can is at column 2, row 0 (0-indexed from bottom-left).
    // Target: "Three up... two across".
    // Row 3, Column 4.
    const TARGET_ROW = 3
    const TARGET_COL = 4

    const handleBrickClick = (r: number, c: number) => {
        if (isSolved) return

        if (r === TARGET_ROW && c === TARGET_COL) {
            setIsSolved(true)
            unlockNextPuzzle()
            // In a real app, play a magical brick rumbling sound here
        } else {
            setFailedAttempt(true)
            setTimeout(() => setFailedAttempt(false), 500)
        }
    }

    return (
        <group position={new THREE.Vector3(...position)}>

            {/* A brick wall background in 3D to ground it */}
            <mesh position={[0, 0, -5]} receiveShadow>
                <planeGeometry args={[20, 15]} />
                <meshStandardMaterial color="#3a2f2a" roughness={1} />
            </mesh>

            {/* A dim alley light */}
            <pointLight position={[0, 5, 2]} intensity={0.5} color="#ffd700" />

            {/* Interactive HTML Puzzle Overlay */}
            {isVisible && (
                <Html position={[0, -0.5, 0]} center distanceFactor={15} zIndexRange={[100, 0]}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '800px',
                        pointerEvents: 'none' // The container ignores clicks
                    }}>

                        {/* Instruction HUD */}
                        <div style={{
                            color: '#e8f4ff',
                            fontFamily: "'Cinzel', serif",
                            textAlign: 'center',
                            textShadow: '0 0 10px rgba(0,0,0,0.8)',
                            background: 'rgba(0,0,0,0.6)',
                            padding: '1.5rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            marginBottom: '2rem',
                            transform: failedAttempt ? 'translateX(5px)' : 'translateX(0)', // simple shake
                            transition: 'transform 0.1s'
                        }}>
                            <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: isSolved ? '#4CAF50' : '#ffd700' }}>
                                The Leaky Cauldron Courtyard
                            </h2>
                            <p style={{ fontSize: '1.1rem', opacity: 0.9, fontFamily: 'sans-serif' }}>
                                {isSolved
                                    ? "✨ The bricks shift and fold away! You're in Diagon Alley."
                                    : '"Three up... two across..." from the bottom left. Tap the right brick to enter.'}
                            </p>
                        </div>

                        {/* Visual Brick Grid */}
                        <div style={{
                            pointerEvents: isSolved ? 'none' : 'auto',
                            display: 'grid',
                            gridTemplateRows: 'repeat(6, 40px)',
                            gridTemplateColumns: 'repeat(10, 60px)',
                            gap: '4px',
                            background: '#1a1005',
                            padding: '10px',
                            border: '4px solid #000',
                            borderRadius: '4px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                            // Explode outward animation if solved
                            opacity: isSolved ? 0 : 1,
                            transform: isSolved ? 'scale(1.2)' : 'scale(1)',
                            transition: 'all 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}>
                            {/* Render grid from top to bottom (Row 5 down to Row 0) to match visual layout */}
                            {[5, 4, 3, 2, 1, 0].map(row => (
                                Array.from({ length: 10 }).map((_, col) => {
                                    // Offset alternate rows for brick pattern
                                    const offset = row % 2 !== 0 ? 'translateX(15px)' : 'none';

                                    return (
                                        <div
                                            key={`brick-${row}-${col}`}
                                            onClick={() => handleBrickClick(row, col)}
                                            style={{
                                                background: '#7c3f28',
                                                border: '1px solid #4a2111',
                                                borderRadius: '2px',
                                                cursor: 'pointer',
                                                transform: offset,
                                                boxShadow: 'inset 0 0 5px rgba(0,0,0,0.5)',
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.3)'}
                                            onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                                        />
                                    )
                                })
                            ))}
                        </div>

                        {/* Gateway hole appears when solved */}
                        {isSolved && (
                            <div style={{
                                position: 'absolute',
                                width: '600px',
                                height: '400px',
                                top: '150px',
                                borderRadius: '50% 50% 0 0',
                                background: 'radial-gradient(circle, #ffeaa7 0%, rgba(255,234,167,0) 70%)',
                                opacity: 0,
                                animation: 'fadeGlow 2s forwards 0.5s',
                                zIndex: -1 // Behind text
                            }} />
                        )}
                    </div>
                </Html>
            )}

            {/* Embedded styles for keyframes */}
            <Html>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes fadeGlow {
                        from { opacity: 0; filter: blur(20px); }
                        to { opacity: 0.8; filter: blur(0px); }
                    }
                `}} />
            </Html>

        </group>
    )
}
