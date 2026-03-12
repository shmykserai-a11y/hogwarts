'use client'

import { useState, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'
import * as THREE from 'three'

export function Hufflepuff() {
    const [unlocked, setUnlocked] = useState(false)
    const [taps, setTaps] = useState<number[]>([])
    const { camera } = useThree()
    const [opacity, setOpacity] = useState(0)
    const groupRef = useRef<THREE.Group>(null)
    const posVec = useRef(new THREE.Vector3())

    useFrame(() => {
        if (!groupRef.current) return
        groupRef.current.getWorldPosition(posVec.current)
        const dist = camera.position.distanceTo(posVec.current)
        const raw = 1 - THREE.MathUtils.clamp((dist - 8) / (18 - 8), 0, 1)
        const next = Math.round(raw * 100) / 100
        setOpacity(prev => Math.abs(next - prev) > 0.02 ? next : prev)
    })

    const handleTap = () => {
        if (unlocked) return
        const now = Date.now()
        const newTaps = [...taps, now]

        if (newTaps.length >= 5) {
            const last5 = newTaps.slice(-5)
            const [d1, d2, d3, d4] = [last5[1] - last5[0], last5[2] - last5[1], last5[3] - last5[2], last5[4] - last5[3]]
            const isShort = (d: number) => d < 400
            const isLong = (d: number) => d >= 400 && d < 1000
            if (isShort(d1) && isLong(d2) && isShort(d3) && isShort(d4)) {
                setUnlocked(true)
                return
            }
            setTaps([])
            return
        }
        setTaps(newTaps)
    }

    return (
        <group ref={groupRef} position={[3, 0, 0]}>
            <mesh
                onClick={handleTap}
                onPointerOver={() => { if (opacity > 0.3) document.body.style.cursor = 'pointer' }}
                onPointerOut={() => document.body.style.cursor = 'auto'}
                position={[0, -0.2, 0]}
            >
                <cylinderGeometry args={[0.5, 0.55, 1.0, 12]} />
                <meshStandardMaterial color={unlocked ? '#f9a825' : '#6d4c2a'} roughness={0.8} />
            </mesh>

            <Html position={[0, -1.5, 0]} center style={{ opacity, pointerEvents: 'none', transition: 'opacity 0.3s' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <div style={{ color: '#fff176', fontFamily: "'Cinzel', serif", fontSize: '0.8rem', whiteSpace: 'nowrap', textShadow: '0 0 8px #f9a825' }}>
                        Hufflepuff
                    </div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.6, color: '#fff9c4', whiteSpace: 'nowrap' }}>
                        Tap: Hel-ga · Huf-fle-puff
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                        {[0, 1, 2, 3, 4].map(i => (
                            <div key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: taps.length > i ? '#f9a825' : 'rgba(255,255,255,0.2)', transition: 'background 0.2s' }} />
                        ))}
                    </div>
                </div>
            </Html>

            <Html zIndexRange={[200, 100]} position={[0, 0.5, 0.3]} center style={{ pointerEvents: 'none' }}>
                <AnimatePresence>
                    {unlocked && (
                        <motion.div initial={{ opacity: 0, y: 10, scale: 0.5 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="glass"
                            style={{ padding: '1rem 1.5rem', textAlign: 'center', border: '1px solid #f9a825', whiteSpace: 'nowrap' }}>
                            <span style={{ fontSize: '1.5rem' }}>🦡</span>
                            <p style={{ margin: '0.3rem 0 0', color: '#fff176', fontWeight: 'bold' }}>"Welcome to the kitchens."</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Html>
        </group>
    )
}
