'use client'

import { useState, useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import * as THREE from 'three'

export function Ravenclaw() {
    const [unlocked, setUnlocked] = useState(false)
    const [showRiddle, setShowRiddle] = useState(false)
    const [error, setError] = useState(false)
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

    useEffect(() => {
        if (opacity < 0.3 && showRiddle) {
            setShowRiddle(false)
        }
    }, [opacity, showRiddle])

    const checkAnswer = (answer: string) => {
        if (answer === '1, NaN, NaN') {
            setUnlocked(true); setShowRiddle(false)
        } else {
            setError(true); setTimeout(() => setError(false), 500)
        }
    }

    return (
        <group ref={groupRef} position={[1, 0, 0]}>
            <mesh
                onClick={() => !unlocked && opacity > 0.3 && setShowRiddle(true)}
                onPointerOver={() => { if (opacity > 0.3) document.body.style.cursor = 'pointer' }}
                onPointerOut={() => document.body.style.cursor = 'auto'}
            >
                <boxGeometry args={[1, 2, 0.25]} />
                <meshStandardMaterial color={unlocked ? '#1565c0' : '#0d2a4a'} />
            </mesh>

            <Html position={[0, -1.5, 0]} center style={{ opacity, pointerEvents: 'none', transition: 'opacity 0.3s' }}>
                <div style={{ color: '#90caf9', fontFamily: "'Cinzel', serif", fontSize: '0.8rem', whiteSpace: 'nowrap', textShadow: '0 0 8px #1565c0' }}>
                    Ravenclaw
                </div>
            </Html>

            <Html zIndexRange={[200, 100]} position={[0, 0.5, 0.3]} center>
                <AnimatePresence>
                    {showRiddle && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                            className="glass"
                            style={{ position: 'relative', padding: '1.5rem', width: '300px', pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'center', border: error ? '1px solid red' : '1px solid rgba(255,255,255,0.1)' }}
                        >
                            <button onClick={() => setShowRiddle(false)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                                <X size={18} />
                            </button>
                            <h3 className="heading-magic" style={{ margin: 0, color: '#bbdefb' }}>Eagle Knocker</h3>
                            <p style={{ margin: 0, fontSize: '0.85rem', textAlign: 'center' }}>What does this return?</p>
                            <code style={{ background: 'rgba(0,0,0,0.5)', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.9rem', color: '#ff7b72' }}>
                                {`['1','2','3'].map(parseInt)`}
                            </code>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
                                {[
                                    { label: '[1, 2, 3]', val: '1, 2, 3' },
                                    { label: '[1, NaN, NaN]', val: '1, NaN, NaN' },
                                    { label: 'Throws Error', val: 'Error' },
                                ].map(opt => (
                                    <button key={opt.val} onClick={() => checkAnswer(opt.val)}
                                        style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '6px', cursor: 'pointer', fontFamily: 'monospace', transition: 'all 0.15s' }}
                                        onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
                                        onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                                    >{opt.label}</button>
                                ))}
                            </div>
                            <button onClick={() => setShowRiddle(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.75rem' }}>Walk away</button>
                        </motion.div>
                    )}
                    {unlocked && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass"
                            style={{ padding: '1rem', textAlign: 'center', border: '1px solid #1565c0', pointerEvents: 'none' }}>
                            <p style={{ margin: 0, color: '#bbdefb' }}>"Wisdom is verified." 🦅</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Html>
        </group>
    )
}
