'use client'

import { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useLocationIndex } from '@/hooks/use-scroll-progress'

// --- Snow Particle System ---
function SnowParticles() {
    const pointsRef = useRef<THREE.Points>(null)
    const COUNT = 800

    const [positions, velocities] = useMemo(() => {
        const pos = new Float32Array(COUNT * 3)
        const vel: { x: number; y: number; z: number }[] = []
        for (let i = 0; i < COUNT; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 40
            pos[i * 3 + 1] = (Math.random() - 0.5) * 20
            pos[i * 3 + 2] = (Math.random() - 0.5) * 30
            vel.push({
                x: (Math.random() - 0.5) * 0.01,
                y: -(0.03 + Math.random() * 0.04), // falling
                z: (Math.random() - 0.5) * 0.01,
            })
        }
        return [pos, vel]
    }, [])

    useFrame(() => {
        if (!pointsRef.current) return
        const arr = pointsRef.current.geometry.attributes.position.array as Float32Array
        for (let i = 0; i < COUNT; i++) {
            arr[i * 3 + 1] += velocities[i].y
            arr[i * 3] += velocities[i].x
            arr[i * 3 + 2] += velocities[i].z
            // Reset when off-screen below
            if (arr[i * 3 + 1] < -10) {
                arr[i * 3 + 1] = 10
                arr[i * 3] = (Math.random() - 0.5) * 40
                arr[i * 3 + 2] = (Math.random() - 0.5) * 30
            }
        }
        pointsRef.current.geometry.attributes.position.needsUpdate = true
    })

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.15} color="#e8f4ff" transparent opacity={0.85} depthWrite={false} sizeAttenuation />
        </points>
    )
}

// --- A single shop building ---
function ShopBuilding({
    position,
    color,
    roofColor,
    windowColor,
    width = 4,
    height = 5,
    label,
    showLabel = true,
    onWindowClick,
    windowEmissiveIntensity = 1.5,
}: {
    position: [number, number, number]
    color: string
    roofColor: string
    windowColor: string
    width?: number
    height?: number
    label?: string
    showLabel?: boolean
    onWindowClick?: () => void
    windowEmissiveIntensity?: number
}) {
    const [hovered, setHovered] = useState(false)

    return (
        <group position={position}>
            {/* Body */}
            <mesh castShadow>
                <boxGeometry args={[width, height, 3]} />
                <meshStandardMaterial color={color} roughness={0.9} />
            </mesh>

            {/* Snowy Roof (tilted planes) */}
            <mesh castShadow position={[0, height / 2 + 0.6, 0]} rotation={[0, 0, 0]}>
                <coneGeometry args={[width * 0.75, 1.5, 4]} />
                <meshStandardMaterial color={roofColor} roughness={1} />
            </mesh>
            {/* Snow on roof */}
            <mesh position={[0, height / 2 + 1.1, 0]} rotation={[0, 0, 0]}>
                <coneGeometry args={[width * 0.78, 0.4, 4]} />
                <meshStandardMaterial color="#ddeeff" roughness={1} />
            </mesh>

            {/* Glowing Window */}
            <mesh
                position={[0, 0.5, 1.52]}
                onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer' }}
                onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto' }}
                onClick={onWindowClick}
            >
                <planeGeometry args={[width * 0.4, height * 0.28]} />
                <meshStandardMaterial
                    color={windowColor}
                    emissive={windowColor}
                    emissiveIntensity={hovered ? windowEmissiveIntensity * 1.8 : windowEmissiveIntensity}
                />
            </mesh>

            {/* Door */}
            <mesh position={[0, -height / 2 + 1, 1.52]}>
                <planeGeometry args={[width * 0.2, height * 0.36]} />
                <meshStandardMaterial color="#3a2010" roughness={0.8} />
            </mesh>

            {/* Shop Sign */}
            {label && showLabel && (
                <Html position={[0, height / 2 + 2, 0]} center distanceFactor={12}>
                    <div style={{
                        color: '#fff8e1',
                        fontFamily: "'Cinzel', serif",
                        fontSize: '0.75rem',
                        background: 'rgba(30,20,5,0.7)',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        whiteSpace: 'nowrap',
                        pointerEvents: 'none',
                        border: '1px solid rgba(255,220,100,0.4)',
                        textShadow: '0 0 8px #ffcc44',
                    }}>
                        {label}
                    </div>
                </Html>
            )}
        </group>
    )
}

// --- Main Hogsmeade Component ---
export function Hogsmeade({ position = [0, -2, -270] }: { position?: [number, number, number] }) {
    const locationIndex = useLocationIndex()
    // 11th location (index 10)
    const isVisible = Math.abs(locationIndex - 10) < 0.9

    const [honeydukesActive, setHoneydukesActive] = useState(false)
    const [broomstickActive, setBroomstickActive] = useState(false)
    const sweetParticlesRef = useRef<THREE.Points>(null)
    const sweetTime = useRef(0)

    const sweetPositions = useMemo(() => {
        const pos = new Float32Array(60 * 3)
        for (let i = 0; i < 60; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 6 - 6
            pos[i * 3 + 1] = (Math.random() - 0.5) * 4
            pos[i * 3 + 2] = (Math.random() - 0.5) * 2
        }
        return pos
    }, [])

    useFrame((_, delta) => {
        if (!isVisible) return
        if (honeydukesActive && sweetParticlesRef.current) {
            sweetTime.current += delta
            const arr = sweetParticlesRef.current.geometry.attributes.position.array as Float32Array
            for (let i = 0; i < 60; i++) {
                arr[i * 3 + 1] += 0.04
                if (arr[i * 3 + 1] > 4) {
                    arr[i * 3 + 1] = -2
                    arr[i * 3] = (Math.random() - 0.5) * 6 - 6
                }
            }
            sweetParticlesRef.current.geometry.attributes.position.needsUpdate = true
            if (sweetTime.current > 3) {
                setHoneydukesActive(false)
                sweetTime.current = 0
            }
        }
    })

    return (
        <group position={new THREE.Vector3(...position)}>
            {/* Snowy Ground */}
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[60, 40]} />
                <meshStandardMaterial color="#c8dff0" roughness={1} />
            </mesh>

            {/* Snow layer on ground (slightly above) */}
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <planeGeometry args={[60, 40]} />
                <meshStandardMaterial color="#deeeff" roughness={1} transparent opacity={0.5} depthWrite={false} />
            </mesh>

            {/* Street cobble path */}
            <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 2]}>
                <planeGeometry args={[4, 30]} />
                <meshStandardMaterial color="#7a7a8a" roughness={1} />
            </mesh>

            {/* === SHOPS + LAMPPOSTS === */}
            <group position={[0, 0, -5]}>
                {/* Left side shops */}
                <ShopBuilding
                    position={[-7, 2.5, 0]}
                    color="#4a3020"
                    roofColor="#2a1a0a"
                    windowColor="#ffcc44"
                    width={5}
                    height={5}
                    label="🍬 Honeydukes"
                    showLabel={isVisible}
                    onWindowClick={() => { if (isVisible) setHoneydukesActive(true); sweetTime.current = 0 }}
                    windowEmissiveIntensity={2}
                />
                <ShopBuilding
                    position={[-13, 2, -3]}
                    color="#3d2e1e"
                    roofColor="#231a10"
                    windowColor="#ff9933"
                    width={4}
                    height={4}
                    label="🪄 Ollivanders"
                    showLabel={isVisible}
                />

                {/* Right side shops */}
                <ShopBuilding
                    position={[7, 2.5, 0]}
                    color="#2c3a2c"
                    roofColor="#1a2a1a"
                    windowColor="#ff8800"
                    width={6}
                    height={5}
                    label="🍺 The Three Broomsticks"
                    showLabel={isVisible}
                    onWindowClick={() => { if (isVisible) setBroomstickActive(true); setTimeout(() => setBroomstickActive(false), 4000) }}
                    windowEmissiveIntensity={1.8}
                />
                <ShopBuilding
                    position={[13, 2, -3]}
                    color="#3a3010"
                    roofColor="#2a2008"
                    windowColor="#aaddff"
                    width={3.5}
                    height={4}
                    label="📮 Post Office"
                    showLabel={isVisible}
                />

                {/* Background accent buildings */}
                <ShopBuilding position={[-5, 1.5, -8]} color="#3a3030" roofColor="#222020" windowColor="#ffddaa" width={3} height={3} />
                <ShopBuilding position={[5, 1.5, -8]} color="#302a20" roofColor="#201a10" windowColor="#ffaa55" width={3} height={3} />
                <ShopBuilding position={[0, 1.5, -10]} color="#2c3020" roofColor="#1c2010" windowColor="#88aaff" width={3} height={3} />

                {/* Lamp posts */}
                {[-5, 0, 5].map((x, i) => (
                    <group key={i} position={[x, 0, 5]}>
                        <mesh castShadow position={[0, 2, 0]}>
                            <cylinderGeometry args={[0.08, 0.08, 4, 6]} />
                            <meshStandardMaterial color="#888899" metalness={0.6} roughness={0.4} />
                        </mesh>
                        <pointLight position={[0, 4.2, 0]} intensity={1.2} color="#ffe8aa" distance={8} />
                        <mesh position={[0, 4.3, 0]}>
                            <sphereGeometry args={[0.25, 8, 8]} />
                            <meshStandardMaterial color="#ffe8aa" emissive="#ffe8aa" emissiveIntensity={3} />
                        </mesh>
                    </group>
                ))}
            </group>

            {/* Honeydukes candy burst particles */}
            {honeydukesActive && (
                <points ref={sweetParticlesRef}>
                    <bufferGeometry>
                        <bufferAttribute attach="attributes-position" args={[sweetPositions, 3]} />
                    </bufferGeometry>
                    <pointsMaterial size={0.4} color="#ff66aa" transparent opacity={0.9} depthWrite={false} sizeAttenuation />
                </points>
            )}

            {/* Lighting */}
            <ambientLight intensity={0.4} color="#aaccff" />
            <directionalLight position={[5, 10, 5]} intensity={0.5} color="#ccddff" />

            {/* Falling Snow */}
            <SnowParticles />

            {/* Title Overlay */}
            {isVisible && (
                <Html position={[0, 4, 0]} center distanceFactor={15} zIndexRange={[100, 0]}>
                    <div style={{
                        color: '#e8f4ff',
                        fontFamily: "'Cinzel', serif",
                        fontSize: '1.5rem',
                        textShadow: '0 0 12px rgba(100,150,255,0.8)',
                        pointerEvents: 'none',
                        userSelect: 'none',
                        textAlign: 'center',
                    }}>
                        Hogsmeade
                        <div style={{
                            fontSize: '0.75rem',
                            opacity: 0.85,
                            marginTop: '8px',
                            fontFamily: 'sans-serif',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                        }}>
                            Click the glowing shop windows
                        </div>
                    </div>
                </Html>
            )}

            {/* Three Broomsticks Toast Overlay */}
            {broomstickActive && isVisible && (
                <Html position={[7, 6, 0]} center distanceFactor={15} zIndexRange={[200, 0]}>
                    <div style={{
                        color: '#fff8e1',
                        fontFamily: "'Cinzel', serif",
                        fontSize: '1.1rem',
                        textShadow: '0 0 8px #ff8800',
                        background: 'rgba(30,15,5,0.85)',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255,140,0,0.5)',
                        pointerEvents: 'none',
                        animation: 'fadeIn 0.3s ease',
                        textAlign: 'center',
                    }}>
                        🍺 Cheers!<br />
                        <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>A butterbeer for the road!</span>
                    </div>
                </Html>
            )}
        </group>
    )
}
