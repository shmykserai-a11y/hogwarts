'use client'

import { useState, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'
import * as THREE from 'three'

export function Slytherin() {
    const [unlocked, setUnlocked] = useState(false)
    const hoverStartRef = useRef<number | null>(null)
    const { camera } = useThree()
    const [opacity, setOpacity] = useState(0)
    const groupRef = useRef<THREE.Group>(null)
    const posVec = useRef(new THREE.Vector3())

    useFrame((state) => {
        if (!groupRef.current) return
        groupRef.current.getWorldPosition(posVec.current)
        const dist = camera.position.distanceTo(posVec.current)
        const raw = 1 - THREE.MathUtils.clamp((dist - 8) / (18 - 8), 0, 1)
        const next = Math.round(raw * 100) / 100
        setOpacity(prev => Math.abs(next - prev) > 0.02 ? next : prev)

        if (!unlocked && hoverStartRef.current !== null) {
            const elapsed = Date.now() / 1000 - hoverStartRef.current
            if (elapsed > 4) setUnlocked(true)
        }
    })

    return (
        <group ref={groupRef} position={[-1, 0, 0]}>
            <mesh
                onPointerOver={() => { hoverStartRef.current = Date.now() / 1000; if (opacity > 0.3) document.body.style.cursor = 'wait' }}
                onPointerOut={() => { hoverStartRef.current = null; document.body.style.cursor = 'auto' }}
            >
                <cylinderGeometry args={[0.6, 0.6, 0.12, 16]} />
                <meshStandardMaterial color="#1b5e20" transparent opacity={0.7} roughness={0} metalness={0.6} />
            </mesh>

            <Html position={[0, -1, 0]} center style={{ opacity, pointerEvents: 'none', transition: 'opacity 0.3s' }}>
                <div style={{ color: '#a5d6a7', fontFamily: "'Cinzel', serif", fontSize: '0.8rem', whiteSpace: 'nowrap', textShadow: '0 0 8px #1b5e20' }}>
                    Slytherin
                </div>
            </Html>

            <Html zIndexRange={[200, 100]} position={[0, 0.5, 0.3]} center style={{ pointerEvents: 'none' }}>
                <AnimatePresence>
                    {unlocked && (
                        <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5 }}
                            className="glass" style={{ padding: '1rem 1.5rem', textAlign: 'center', border: '1px solid #1b5e20', whiteSpace: 'nowrap' }}>
                            <span style={{ fontSize: '1.5rem' }}>🦑</span>
                            <p style={{ margin: '0.3rem 0 0', color: '#a5d6a7', fontWeight: 'bold' }}>"Happy Birthday!"</p>
                            <p style={{ margin: '0.2rem 0 0', fontSize: '0.7rem', opacity: 0.6 }}>The Giant Squid approves</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Html>
        </group>
    )
}
