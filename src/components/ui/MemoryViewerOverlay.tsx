'use client'

import { useStore } from '@/lib/store'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export function MemoryViewerOverlay() {
    const { activeMemoryUrl, setActiveMemoryUrl } = useStore()

    if (!activeMemoryUrl) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 200,          // Above everything else
                    pointerEvents: 'auto', // Capture clicks
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'radial-gradient(circle at center, rgba(10, 14, 23, 0.8) 0%, rgba(0, 0, 0, 0.95) 100%)',
                    backdropFilter: 'blur(8px)',
                }}
            >
                {/* Close Button */}
                <button
                    onClick={() => setActiveMemoryUrl(null)}
                    style={{
                        position: 'absolute',
                        top: '2rem',
                        right: '2rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'rgba(255, 255, 255, 0.6)',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        transition: 'color 0.2s',
                        zIndex: 201
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                >
                    <X size={32} />
                </button>

                {/* Video container with magical border */}
                <div style={{
                    position: 'relative',
                    width: '80vw',
                    maxWidth: '1000px',
                    aspectRatio: '16/9',
                    borderRadius: '8px',
                    padding: '4px',
                    background: 'linear-gradient(45deg, rgba(68, 85, 136, 0.5), rgba(136, 204, 255, 0.8), rgba(68, 85, 136, 0.5))',
                    boxShadow: '0 0 40px rgba(136, 204, 255, 0.2)',
                    overflow: 'hidden'
                }}>
                    <video
                        src={activeMemoryUrl}
                        controls
                        autoPlay
                        loop
                        style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#000',
                            borderRadius: '4px',
                            objectFit: 'cover'
                        }}
                    >
                        Your browser does not support HTML video.
                    </video>

                    {/* Mystical vignette overlay inside the video border */}
                    <div style={{
                        position: 'absolute',
                        top: 4,
                        left: 4,
                        right: 4,
                        bottom: 4,
                        pointerEvents: 'none',
                        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.8)',
                        borderRadius: '4px'
                    }} />
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
