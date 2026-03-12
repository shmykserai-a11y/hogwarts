'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'

export function AcceptanceLetter() {
    const { hasReadLetter, readLetter } = useStore()
    const [isOpened, setIsOpened] = useState(false)

    // Sequence states
    // 1. Initial: Envelope falls into view
    // 2. Opened: Wax seal broken, letter slides out
    // 3. Accepted: Overlay fades away entirely

    if (hasReadLetter) return null

    return (
        <AnimatePresence>
            {!hasReadLetter && (
                <motion.div
                    className="glass"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeOut" } }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        background: 'rgba(5, 7, 12, 0.85)',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        perspective: '1000px'
                    }}
                >
                    {!isOpened ? (
                        // THE ENVELOPE
                        <motion.div
                            initial={{ y: -500, rotateZ: -10, scale: 0.5 }}
                            animate={{ y: 0, rotateZ: 0, scale: 1 }}
                            transition={{ type: 'spring', damping: 12, stiffness: 100, mass: 1 }}
                            whileHover={{ scale: 1.05, translateY: -10 }}
                            onClick={() => setIsOpened(true)}
                            style={{
                                width: '400px',
                                height: '250px',
                                background: '#f4ecd8',
                                borderRadius: '8px',
                                position: 'relative',
                                cursor: 'pointer',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {/* Envelope Flaps (CSS Drawings) */}
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                border: '125px solid transparent',
                                borderTop: '130px solid #e3d5b8',
                                zIndex: 2
                            }} />
                            <div style={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                border: '125px solid transparent',
                                borderBottom: '130px solid #e8dbbf',
                                zIndex: 1
                            }} />

                            {/* Wax Seal */}
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    background: '#8b0000', // Dark Gryffindor red
                                    borderRadius: '50%',
                                    position: 'absolute',
                                    zIndex: 3,
                                    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5), 0 5px 10px rgba(0,0,0,0.4)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontFamily: "'Cinzel', serif",
                                    color: '#d4af37',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                                }}
                            >
                                H
                            </motion.div>

                            <p style={{ position: 'absolute', bottom: '-40px', color: '#fff', opacity: 0.6, fontFamily: 'monospace' }}>
                                Click the seal to open
                            </p>
                        </motion.div>
                    ) : (
                        // THE LETTER PARCHMENT
                        <motion.div
                            initial={{ y: 200, opacity: 0, rotateX: 20 }}
                            animate={{ y: 0, opacity: 1, rotateX: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            style={{
                                width: '90%',
                                maxWidth: '600px',
                                maxHeight: '85vh',
                                background: '#f4ecd8',
                                padding: '3rem',
                                borderRadius: '4px',
                                boxShadow: '0 0 50px rgba(212, 175, 55, 0.2), inset 0 0 30px rgba(0,0,0,0.05)',
                                color: '#2c1e16',
                                overflowY: 'auto',
                                position: 'relative'
                            }}
                        >
                            {/* Hogwarts Crest Placeholder */}
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🦅🦁🐍🦡</div>
                                <h1 style={{ fontFamily: "'Cinzel', serif", margin: 0, fontSize: '1.8rem', borderBottom: '1px solid #c0a87d', paddingBottom: '1rem' }}>
                                    HOGWARTS SCHOOL of MAGIC & CODE
                                </h1>
                            </div>

                            <div style={{ fontFamily: "Georgia, serif", fontSize: '1.1rem', lineHeight: 1.6 }}>
                                <p>Dear Full-Stack Sorcerer,</p>
                                <p>
                                    We are pleased to inform you that you have been accepted at Hogwarts School of Magic & Code.
                                    Please find enclosed a list of all necessary spells and algorithms.
                                </p>
                                <p>
                                    Term begins immediately. We await your terminal commands.
                                </p>
                                <br />
                                <p>Yours sincerely,</p>
                                <p style={{ fontFamily: "'Cinzel', serif", fontWeight: 'bold', fontSize: '1.2rem', margin: 0 }}>Minerva McGonagall</p>
                                <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>Deputy Headmistress</p>
                            </div>

                            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                                <motion.button
                                    whileHover={{ scale: 1.05, background: '#1a2332', color: '#fff' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={readLetter}
                                    style={{
                                        background: 'transparent',
                                        border: '2px solid #2c1e16',
                                        color: '#2c1e16',
                                        padding: '0.8rem 2rem',
                                        fontFamily: "'Cinzel', serif",
                                        fontSize: '1.1rem',
                                        cursor: 'pointer',
                                        borderRadius: '4px',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    Board the Express
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    )
}
