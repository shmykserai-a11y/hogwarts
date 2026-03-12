'use client'

import { useState, useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import * as THREE from 'three'
import { useStore } from '@/lib/store'

export function Gryffindor() {
    const [unlocked, setUnlocked] = useState(false)
    const [showRiddle, setShowRiddle] = useState(false)
    const [inputVal, setInputVal] = useState('')
    const [error, setError] = useState(false)
    const { setActiveRoom } = useStore()
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

    const checkPassword = (e: React.FormEvent) => {
        e.preventDefault()
        if (inputVal.toLowerCase() === 'caput draconis') {
            setUnlocked(true); setShowRiddle(false)
            // Teleport after letting them read the success text
            setTimeout(() => setActiveRoom('gryffindor'), 1500)
        } else {
            setError(true); setTimeout(() => setError(false), 800)
        }
    }

    return (
        <group ref={groupRef} position={[-3, 0, 0]}>
            {/* Door mesh — clickable via R3F raycasting */}
            <mesh
                onClick={() => {
                    if (opacity > 0.3) {
                        if (!unlocked) setShowRiddle(true)
                        else setActiveRoom('gryffindor')
                    }
                }}
                onPointerOver={() => { if (opacity > 0.3) document.body.style.cursor = 'pointer' }}
                onPointerOut={() => document.body.style.cursor = 'auto'}
            >
                <boxGeometry args={[1, 2, 0.25]} />
                <meshStandardMaterial color={unlocked ? '#d32f2f' : '#5e1010'} />
            </mesh>

            {/* Label */}
            <Html position={[0, -1.5, 0]} center style={{ opacity, pointerEvents: 'none', transition: 'opacity 0.3s' }}>
                <div style={{ color: '#e8a0a0', fontFamily: "'Cinzel', serif", fontSize: '0.8rem', whiteSpace: 'nowrap', textShadow: '0 0 8px #d32f2f' }}>
                    Gryffindor
                </div>
            </Html>

            {/* Dialog overlay */}
            <Html zIndexRange={[200, 100]} position={[0, 0.5, 0.3]} center>
                <AnimatePresence>
                    {showRiddle && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                            className="glass"
                            style={{ position: 'relative', padding: '1.5rem', width: '280px', pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'center' }}
                        >
                            <button onClick={() => setShowRiddle(false)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                                <X size={18} />
                            </button>
                            <h3 className="heading-magic" style={{ margin: 0, color: '#ffdddd' }}>The Fat Lady</h3>
                            <p style={{ margin: 0, fontSize: '0.9rem', fontStyle: 'italic' }}>"Password, dear?"</p>
                            {/* Hidden hint in alt text */}
                            <div style={{ position: 'absolute', top: 4, right: 6, opacity: 0.05, fontSize: '0.5rem' }}>
                                <img src="data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==" alt="caput draconis" width={1} height={1} />
                            </div>
                            <form onSubmit={checkPassword} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                                <input type="text" value={inputVal} onChange={e => setInputVal(e.target.value)} autoFocus
                                    style={{ padding: '0.5rem', borderRadius: '6px', border: `1px solid ${error ? '#ff4444' : 'rgba(255,255,255,0.2)'}`, background: 'rgba(0,0,0,0.5)', color: 'white', outline: 'none', fontFamily: 'monospace' }} placeholder="Inspect the page..." />
                                <button type="submit" style={{ padding: '0.5rem', background: '#d32f2f', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontFamily: "'Cinzel', serif" }}>Speak</button>
                            </form>
                            <button onClick={() => setShowRiddle(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.75rem' }}>
                                Walk away
                            </button>
                        </motion.div>
                    )}
                    {unlocked && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass"
                            style={{ padding: '1rem', textAlign: 'center', border: '1px solid #d32f2f', pointerEvents: 'none' }}>
                            <p style={{ margin: 0, color: '#ffdddd' }}>"Enter, brave one." 🦁</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Html>
        </group>
    )
}
