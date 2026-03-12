'use client'

import { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

interface LocationProps {
    position: [number, number, number]
}

export function ForbiddenForest({ position }: LocationProps) {
    const meshRef = useRef<THREE.Mesh>(null)
    const { camera } = useThree()
    const [opacity, setOpacity] = useState(0)
    const posVec = useRef(new THREE.Vector3(...position))
    const [lumosOn, setLumosOn] = useState(false)

    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        if (meshRef.current) meshRef.current.rotation.z = Math.sin(t) * 0.12

        const dist = camera.position.distanceTo(posVec.current)
        const raw = 1 - THREE.MathUtils.clamp((dist - 8) / (18 - 8), 0, 1)
        const next = Math.round(raw * 100) / 100
        setOpacity(prev => Math.abs(next - prev) > 0.02 ? next : prev)
    })

    return (
        <group position={position}>
            {/* Dark forest tree silhouettes */}
            {[-2, 0, 2, -1, 1].map((x, i) => (
                <mesh
                    key={i}
                    ref={i === 0 ? meshRef : undefined}
                    position={[x * 1.2, 0, i * 0.3]}
                    onClick={() => { if (opacity > 0.3) setLumosOn(true) }}
                    onPointerOver={() => { if (opacity > 0.3) document.body.style.cursor = 'pointer' }}
                    onPointerOut={() => document.body.style.cursor = 'auto'}
                >
                    <coneGeometry args={[0.5 + i * 0.1, 2.5 + i * 0.5, 5]} />
                    <meshStandardMaterial color={lumosOn ? `#2e4a36` : `#0f1a14`} roughness={0.8} />
                </mesh>
            ))}

            {/* Lumos point light effect when activated */}
            {lumosOn && (
                <pointLight
                    position={[0, 2, 4]}
                    intensity={15}
                    color="#fffde7"
                    distance={20}
                />
            )}

            <Html
                position={[0, -2, 0]}
                center
                style={{ opacity, pointerEvents: opacity > 0.3 ? 'auto' : 'none', transition: 'opacity 0.3s' }}
            >
                <div className="glass" style={{ padding: '0.75rem 1.5rem', textAlign: 'center' }}>
                    <h2 className="heading-magic" style={{ fontSize: '1.1rem', margin: 0, color: lumosOn ? '#fff' : '#a0aab5' }}>Forbidden Forest</h2>
                    <p style={{ fontSize: '0.78rem', opacity: 0.8, marginTop: '4px' }}>
                        {lumosOn ? (
                            <span style={{ color: '#fffde7', textShadow: '0 0 10px #fffde7' }}>The path is illuminated.</span>
                        ) : (
                            <span>
                                <span
                                    style={{ fontFamily: 'monospace', color: '#00d2ff', cursor: 'pointer', borderBottom: '1px dashed #00d2ff' }}
                                    onClick={() => setLumosOn(true)}
                                    onMouseOver={e => e.currentTarget.style.textShadow = '0 0 8px #00d2ff'}
                                    onMouseOut={e => e.currentTarget.style.textShadow = 'none'}
                                >Lumos</span> required.
                            </span>
                        )}
                    </p>
                </div>
            </Html>
        </group>
    )
}

