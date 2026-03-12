'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '@/lib/store'
import { useLocationIndex } from '@/hooks/use-scroll-progress'
import { Html } from '@react-three/drei'

export function Library() {
    const groupRef = useRef<THREE.Group>(null)
    const instancedMeshRef = useRef<THREE.InstancedMesh>(null)
    const pointsRef = useRef<THREE.Points>(null)

    const { isLumosActive, setJsSpellsOpen } = useStore()
    const locationIndex = useLocationIndex()
    const isVisible = Math.abs(locationIndex - 5) < 0.8 // Only show HTML when near the Library


    // --- Instanced Books Setup ---
    const bookCount = 50
    const dummy = useMemo(() => new THREE.Object3D(), [])
    const bookPositions = useMemo(() => {
        const positions = []
        for (let i = 0; i < bookCount; i++) {
            positions.push({
                x: (Math.random() - 0.5) * 15,
                y: Math.random() * 8 + 2,
                z: (Math.random() - 0.5) * 10,
                rotX: Math.random() * Math.PI,
                rotY: Math.random() * Math.PI,
                rotZ: Math.random() * Math.PI,
                speed: Math.random() * 0.02 + 0.005
            })
        }
        return positions
    }, [bookCount])

    // --- Dust Particles Setup ---
    const dustCount = 300
    const dustPositions = useMemo(() => {
        const d = new Float32Array(dustCount * 3)
        for (let i = 0; i < dustCount * 3; i++) {
            d[i] = (Math.random() - 0.5) * 20
        }
        return d
    }, [dustCount])

    useFrame((state) => {
        const time = state.clock.getElapsedTime()

        // Animate floating books
        if (instancedMeshRef.current) {
            bookPositions.forEach((book, i) => {
                dummy.position.set(
                    book.x + Math.sin(time * book.speed + i) * 0.5,
                    book.y + Math.cos(time * book.speed + i) * 0.5,
                    book.z
                )
                dummy.rotation.set(
                    book.rotX + time * 0.2,
                    book.rotY + time * 0.1,
                    book.rotZ
                )
                dummy.updateMatrix()
                instancedMeshRef.current!.setMatrixAt(i, dummy.matrix)
            })
            instancedMeshRef.current.instanceMatrix.needsUpdate = true
        }

        // Animate dust particles slowly upwards
        if (pointsRef.current) {
            pointsRef.current.rotation.y = time * 0.05
        }
    })

    return (
        <group ref={groupRef} position={[0, -2, -120]}>
            <ambientLight intensity={0.1} color="#0a0a1a" />

            {/* LUMOS Effect */}
            <pointLight
                position={[0, 5, 0]}
                intensity={isLumosActive ? 15 : 0}
                distance={20}
                color="#e0f7fa"
            />

            {/* Central Pedestal */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[1, 1.2, 2, 8]} />
                <meshStandardMaterial color="#2d1b11" roughness={0.9} />
            </mesh>

            {/* The Interactive Grimoire */}
            <mesh
                position={[0, 1.1, 0]}
                rotation={[-0.2, 0, 0]}
                onClick={() => isVisible && setJsSpellsOpen(true)}
                onPointerOver={() => isVisible && (document.body.style.cursor = 'pointer')}
                onPointerOut={() => isVisible && (document.body.style.cursor = 'auto')}
            >
                <boxGeometry args={[1.5, 0.2, 1.2]} />
                <meshStandardMaterial color={isLumosActive ? "#c0a87d" : "#4a3c31"} emissive={isLumosActive ? "#d4af37" : "#000000"} emissiveIntensity={isLumosActive ? 0.5 : 0} />
                {isVisible && (
                    <Html position={[0, 0.3, 0]} center distanceFactor={10}>
                        <div style={{
                            color: isLumosActive ? '#fff' : 'rgba(255,255,255,0.4)',
                            fontFamily: "'Cinzel', serif",
                            fontSize: '1rem',
                            textShadow: isLumosActive ? '0 0 10px #d4af37' : 'none',
                            pointerEvents: 'none',
                            userSelect: 'none'
                        }}>
                            The Code Grimoire
                        </div>
                    </Html>
                )}
            </mesh>

            {/* Instanced Floating Books */}
            <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, bookCount]} castShadow>
                <boxGeometry args={[0.8, 1.2, 0.15]} />
                <meshStandardMaterial color="#3e2723" roughness={0.7} />
            </instancedMesh>

            {/* Floating Dust Motes */}
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[dustPositions, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial size={0.05} color="#d4af37" transparent opacity={0.4} sizeAttenuation />
            </points>

            {/* Hidden Message that appears only with lumos */}
            {isLumosActive && isVisible && (
                <Html position={[-3, 4, -5]} className="glass" distanceFactor={15}>
                    <div style={{
                        color: '#d4af37',
                        fontFamily: 'monospace',
                        padding: '1rem',
                    }}>
                        // Secret Note:<br />
                        // The Chamber of Variables has been opened.
                    </div>
                </Html>
            )}
        </group>
    )
}
