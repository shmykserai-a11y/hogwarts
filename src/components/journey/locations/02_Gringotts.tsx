'use client'

import { useState } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '@/lib/store'
import { usePuzzleLocationIndex } from '@/hooks/use-puzzle-scroll'

export function Gringotts({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
    const locationIndex = usePuzzleLocationIndex()
    const { maxUnlockedIndex, unlockNextPuzzle } = useStore()

    // In our rig, Gringotts is at index 2
    const isVisible = Math.abs(locationIndex - 2) < 0.9
    const [isSolved, setIsSolved] = useState(maxUnlockedIndex > 2)

    const [inputValue, setInputValue] = useState('')
    const [isError, setIsError] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (isSolved) return

        if (inputValue.trim() === '687') {
            setIsSolved(true)
            setIsError(false)
            unlockNextPuzzle()
        } else {
            setIsError(true)
            setInputValue('')
            setTimeout(() => setIsError(false), 2000)
        }
    }

    return (
        <group position={new THREE.Vector3(...position)}>

            {/* Giant Vault Door (Metal Circle) */}
            <mesh position={[0, 0, -5]} castShadow receiveShadow>
                <cylinderGeometry args={[8, 8, 2, 32]} />
                <meshStandardMaterial
                    color={isSolved ? "#a0aba2" : "#909590"}
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>

            {/* Inner rotating vault gears (visuals) */}
            <mesh position={[0, 0, -3.9]} rotation={[0, 0, isSolved ? Math.PI / 4 : 0]}>
                <torusGeometry args={[5, 0.5, 16, 50]} />
                <meshStandardMaterial color="#444" metalness={0.9} />
            </mesh>

            <ambientLight intensity={0.2} />
            <pointLight position={[0, 0, -2]} intensity={isSolved ? 2 : 1} color={isSolved ? "#d4af37" : "#a1e5ff"} />

            {/* Interactive HTML Puzzle Overlay */}
            {isVisible && (
                <Html position={[0, 0, 0]} center distanceFactor={15} zIndexRange={[100, 0]}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '500px',
                        background: 'rgba(5, 5, 5, 0.8)',
                        padding: '2.5rem',
                        borderRadius: '12px',
                        border: '2px solid #cd7f32', // bronze border
                        boxShadow: '0 10px 40px rgba(0,0,0,0.9)',
                    }}>

                        <h2 style={{
                            fontSize: '2.2rem',
                            margin: '0 0 1rem 0',
                            color: '#e6c27a',
                            fontFamily: "'Cinzel', serif",
                            textShadow: '0 2px 4px rgba(0,0,0,1)'
                        }}>
                            Gringotts Wizarding Bank
                        </h2>

                        <p style={{
                            fontSize: '1.2rem',
                            color: '#ccc',
                            textAlign: 'center',
                            fontFamily: "sans-serif",
                            marginBottom: '2rem'
                        }}>
                            {isSolved
                                ? "Vault opened. The galleons are yours! Scroll to continue."
                                : "A stern goblin peers down at you. 'Key please. And what is the vault number, Mr. Potter?'"
                            }
                        </p>

                        {!isSolved && (
                            <form
                                onSubmit={handleSubmit}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem',
                                    width: '100%'
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder="Enter Vault Number"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    maxLength={4}
                                    style={{
                                        padding: '1rem',
                                        fontSize: '1.5rem',
                                        textAlign: 'center',
                                        background: isError ? '#3a0000' : '#111',
                                        color: isError ? '#ff4444' : '#fff',
                                        border: `2px solid ${isError ? '#ff0000' : '#e6c27a'}`,
                                        borderRadius: '6px',
                                        fontFamily: "'Courier New', Courier, monospace",
                                        letterSpacing: '5px',
                                        outline: 'none',
                                        transition: 'all 0.3s'
                                    }}
                                />
                                <button
                                    type="submit"
                                    disabled={inputValue.length === 0}
                                    style={{
                                        padding: '1rem',
                                        fontSize: '1.2rem',
                                        background: 'linear-gradient(to bottom, #d4af37, #aa8022)',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontFamily: "'Cinzel', serif",
                                        fontWeight: 'bold',
                                        cursor: inputValue.length > 0 ? 'pointer' : 'not-allowed',
                                        opacity: inputValue.length > 0 ? 1 : 0.5
                                    }}
                                >
                                    OPEN VAULT
                                </button>

                                {isError && (
                                    <div style={{ color: '#ff4444', textAlign: 'center', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                        "Incorrect! State your business or leave," snarls the goblin.
                                    </div>
                                )}
                            </form>
                        )}

                        {/* Glow effect on solve */}
                        {isSolved && (
                            <div style={{
                                position: 'absolute',
                                top: '50%', left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '200%', height: '200%',
                                background: 'radial-gradient(circle, rgba(212,175,55,0.2) 0%, rgba(0,0,0,0) 70%)',
                                pointerEvents: 'none',
                                zIndex: -1
                            }} />
                        )}
                    </div>
                </Html>
            )}
        </group>
    )
}
