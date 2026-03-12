'use client'

import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useLocationIndex } from '@/hooks/use-scroll-progress'

export function HagridsHut({ position = [0, -2, -240] }: { position?: [number, number, number] }) {
    const groupRef = useRef<THREE.Group>(null)
    const eggRef = useRef<THREE.Group>(null)
    const smokeRef = useRef<THREE.Points>(null)

    const [clicks, setClicks] = useState(0)
    const [isVibrating, setIsVibrating] = useState(false)
    const vibrationTimer = useRef(0)

    const locationIndex = useLocationIndex()
    // 10th location (index 9)
    const isVisible = Math.abs(locationIndex - 9) < 0.8
    const isHatched = clicks >= 5

    // Smoke Particle System Memoization
    const particleCount = 50
    const [smokePositions, smokeVelocities] = useMemo(() => {
        const positions = new Float32Array(particleCount * 3)
        const velocities = []
        for (let i = 0; i < particleCount; i++) {
            // Start positions inside the chimney
            positions[i * 3] = -2 + (Math.random() - 0.5) * 0.5
            positions[i * 3 + 1] = 6 + Math.random() * 2
            positions[i * 3 + 2] = -5 + (Math.random() - 0.5) * 0.5

            velocities.push({
                y: 0.02 + Math.random() * 0.02,
                x: (Math.random() - 0.5) * 0.01,
                z: (Math.random() - 0.5) * 0.01
            })
        }
        return [positions, velocities]
    }, [])

    useFrame((state, delta) => {
        if (!isVisible) return

        const time = state.clock.getElapsedTime()

        // Egg Vibration Logic
        if (eggRef.current && !isHatched) {
            if (isVibrating) {
                vibrationTimer.current -= delta
                if (vibrationTimer.current <= 0) {
                    setIsVibrating(false)
                    eggRef.current.position.set(2, 1, 5) // Reset position
                    eggRef.current.rotation.set(0, 0, 0)
                } else {
                    // Intense shaking based on click count
                    const intensity = 0.05 * clicks
                    eggRef.current.position.x = 2 + (Math.random() - 0.5) * intensity
                    eggRef.current.position.z = -2 + (Math.random() - 0.5) * intensity
                    eggRef.current.rotation.z = (Math.random() - 0.5) * intensity * 2
                }
            } else {
                // Gentle idle breathing/pulsing
                const scale = 1 + Math.sin(time * 2) * 0.02
                eggRef.current.scale.set(scale, scale, scale)
            }
        }

        // Animate Smoke
        if (smokeRef.current) {
            const positions = smokeRef.current.geometry.attributes.position.array as Float32Array
            for (let i = 0; i < particleCount; i++) {
                positions[i * 3 + 1] += smokeVelocities[i].y // Move up
                positions[i * 3] += smokeVelocities[i].x     // Move sideways (wind)
                positions[i * 3 + 2] += smokeVelocities[i].z

                // Reset particle if it goes too high
                if (positions[i * 3 + 1] > 12) {
                    positions[i * 3 + 1] = 6 // Reset to chimney height
                    positions[i * 3] = -2 + (Math.random() - 0.5) * 0.5
                    positions[i * 3 + 2] = -5 + (Math.random() - 0.5) * 0.5
                }
            }
            smokeRef.current.geometry.attributes.position.needsUpdate = true
        }
    })

    const handleEggClick = () => {
        if (isHatched || !isVisible) return
        setClicks(c => c + 1)
        setIsVibrating(true)
        vibrationTimer.current = 0.5 // Vibrate for 0.5 seconds per click
    }

    return (
        <group position={new THREE.Vector3(...position)} ref={groupRef}>
            {/* Dark Forest Ground */}
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[20, 64]} />
                <meshStandardMaterial color="#1a2e1a" roughness={1} />
            </mesh>

            {/* Localized "Fog" Planes */}
            {Array.from({ length: 5 }).map((_, i) => (
                <mesh key={i} position={[(Math.random() - 0.5) * 20, 1, (Math.random() - 0.5) * 20]} rotation={[-Math.PI / 2, 0, Math.random() * Math.PI]}>
                    <planeGeometry args={[15, 15]} />
                    <meshBasicMaterial color="#4a5a4a" transparent opacity={0.1} depthWrite={false} />
                </mesh>
            ))}

            {/* Hagrid's Hut Base */}
            <group position={[0, 0, 0]}>
                {/* Main Body */}
                <mesh castShadow position={[0, 2, 0]}>
                    <cylinderGeometry args={[4, 4, 4, 8]} />
                    <meshStandardMaterial color="#4a3b2c" roughness={0.9} />
                </mesh>

                {/* Roof */}
                <mesh castShadow position={[0, 5.5, 0]}>
                    <coneGeometry args={[4.5, 3, 8]} />
                    <meshStandardMaterial color="#2d241a" roughness={1} />
                </mesh>

                {/* Chimney */}
                <mesh castShadow position={[-2, 5, 0]}>
                    <cylinderGeometry args={[0.4, 0.4, 3, 4]} />
                    <meshStandardMaterial color="#5c5c5c" roughness={0.8} />
                </mesh>

                {/* Door */}
                <mesh position={[0, 1.5, 4.05]}>
                    <planeGeometry args={[1.5, 3]} />
                    <meshStandardMaterial color="#2a1b0f" roughness={0.8} />
                </mesh>

                {/* Glowing Window */}
                <mesh position={[-2, 2, 3.5]} rotation={[0, -Math.PI / 6, 0]}>
                    <planeGeometry args={[1, 1]} />
                    <meshStandardMaterial color="#ffaa00" emissive="#ffaa00" emissiveIntensity={2} />
                </mesh>
            </group>

            {/* Smoke Particle System */}
            <points ref={smokeRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[smokePositions, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial size={0.8} color="#cccccc" transparent opacity={0.3} depthWrite={false} />
            </points>

            {/* Tree Stump */}
            <mesh castShadow receiveShadow position={[2, 0.5, 5]}>
                <cylinderGeometry args={[0.8, 1, 1, 8]} />
                <meshStandardMaterial color="#3d2b1f" roughness={1} />
            </mesh>

            {/* Dragon Egg */}
            <group
                ref={eggRef}
                position={[2, 1, 5]}
                onClick={handleEggClick}
                onPointerOver={() => {
                    if (isVisible && !isHatched) document.body.style.cursor = 'pointer'
                }}
                onPointerOut={() => {
                    document.body.style.cursor = 'auto'
                }}
            >
                {!isHatched ? (
                    // The Egg
                    <mesh castShadow position={[0, 0.4, 0]}>
                        <sphereGeometry args={[0.4, 32, 32]} />
                        <meshStandardMaterial
                            color="#1a1a1a" // Black dragon egg
                            roughness={0.4}
                            metalness={0.2}
                            // Glows slightly red as it gets closer to hatching
                            emissive="#ff0000"
                            emissiveIntensity={clicks * 0.1}
                        />
                    </mesh>
                ) : (
                    // Hatched Baby Dragon (Simplified as a glowing form)
                    <group position={[0, 0.5, 0]}>
                        {/* Broken egg shell bottom */}
                        <mesh castShadow position={[0, -0.2, 0]}>
                            <sphereGeometry args={[0.4, 16, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
                            <meshStandardMaterial color="#1a1a1a" roughness={0.8} side={THREE.DoubleSide} />
                        </mesh>

                        {/* Baby Dragon Core */}
                        <mesh castShadow position={[0, 0.2, 0]}>
                            <sphereGeometry args={[0.2, 16, 16]} />
                            <meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={2} />
                        </mesh>

                        {/* Little wings */}
                        <mesh position={[-0.2, 0.2, 0]} rotation={[0, 0, Math.PI / 4]}>
                            <planeGeometry args={[0.3, 0.1]} />
                            <meshStandardMaterial color="#882200" side={THREE.DoubleSide} />
                        </mesh>
                        <mesh position={[0.2, 0.2, 0]} rotation={[0, 0, -Math.PI / 4]}>
                            <planeGeometry args={[0.3, 0.1]} />
                            <meshStandardMaterial color="#882200" side={THREE.DoubleSide} />
                        </mesh>
                    </group>
                )}
            </group>

            {/* Hut Lighting */}
            <ambientLight intensity={0.2} />
            <pointLight position={[0, 5, -2]} intensity={2} color="#ff8800" distance={15} castShadow />
            <pointLight position={[2, 2, -2]} intensity={isHatched ? 2 : clicks * 0.3} color="#ff0000" distance={5} />

            {/* UI Overlay */}
            {isVisible && (
                <Html position={[0, 4, 0]} center distanceFactor={15} zIndexRange={[100, 0]}>
                    <div style={{
                        color: '#ffffff',
                        fontFamily: "'Cinzel', serif",
                        fontSize: '1.5rem',
                        textShadow: '0 0 10px rgba(0,0,0,0.8)',
                        pointerEvents: 'none',
                        userSelect: 'none',
                        textAlign: 'center'
                    }}>
                        Hagrid's Hut
                        <div style={{
                            fontSize: '0.8rem',
                            opacity: 0.8,
                            marginTop: '8px',
                            fontFamily: 'sans-serif',
                            textTransform: 'uppercase',
                            letterSpacing: '1px'
                        }}>
                            {isHatched
                                ? "Norbert has hatched!"
                                : clicks > 0
                                    ? "It's getting hot... keep tapping!"
                                    : "Click the strange black egg on the stump..."}
                        </div>
                    </div>
                </Html>
            )}
        </group>
    )
}
