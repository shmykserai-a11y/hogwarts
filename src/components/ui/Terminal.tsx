'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Terminal as TerminalIcon } from 'lucide-react'

interface TerminalProps {
    isOpen: boolean
    onClose: () => void
}

export function TerminalOverlay({ isOpen, onClose }: TerminalProps) {
    const [lines, setLines] = useState<string[]>([
        'HOGWARDS OS v1.0.0 initializing...',
        'Connecting to magic network...',
        'Connected.',
        'Type "help" for a list of spells.'
    ])
    const [input, setInput] = useState('')
    const bottomRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [isOpen])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [lines])

    const handleCommand = (cmd: string) => {
        const trimmed = cmd.trim().toLowerCase()
        if (!trimmed) return

        setLines(prev => [...prev, `> ${cmd}`])

        let response = ''
        switch (trimmed) {
            case 'help':
                response = 'Available spells: help, clear, lumos, nox, whoami'
                break
            case 'clear':
                setLines([])
                return
            case 'lumos':
                response = 'A blinding light flashes. (System brightness 100%)'
                break
            case 'nox':
                response = 'The darkness returns.'
                break
            case 'whoami':
                response = 'You are the Frontend Sorceress.'
                break
            default:
                response = `Unknown spell: ${trimmed}`
        }

        setTimeout(() => {
            setLines(prev => [...prev, response])
        }, 300)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        width: '450px',
                        height: '350px',
                        zIndex: 200,
                        pointerEvents: 'auto',
                    }}
                >
                    <div className="glass" style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid rgba(0, 210, 255, 0.3)',
                        boxShadow: '0 0 30px rgba(0, 210, 255, 0.1)',
                        overflow: 'hidden'
                    }}>
                        {/* Header */}
                        <div style={{
                            padding: '0.8rem 1rem',
                            background: 'rgba(0, 0, 0, 0.4)',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#00d2ff', fontSize: '0.85rem', fontFamily: 'monospace' }}>
                                <TerminalIcon size={14} /> Dungeon of Code
                            </div>
                            <button
                                onClick={onClose}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Output area */}
                        <div style={{
                            flex: 1,
                            padding: '1rem',
                            overflowY: 'auto',
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            color: '#e0e0e0',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.4rem'
                        }}>
                            {lines.map((l, i) => (
                                <div key={i} style={{ opacity: l.startsWith('>') ? 0.7 : 1, color: l.startsWith('>') ? '#aaa' : '#00d2ff' }}>
                                    {l}
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </div>

                        {/* Input area */}
                        <div style={{
                            padding: '0.8rem 1rem',
                            background: 'rgba(0, 0, 0, 0.3)',
                            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <span style={{ color: '#00d2ff', fontFamily: 'monospace' }}>$</span>
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') {
                                        handleCommand(input)
                                        setInput('')
                                    }
                                }}
                                style={{
                                    flex: 1,
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'white',
                                    fontFamily: 'monospace',
                                    fontSize: '0.9rem',
                                    outline: 'none'
                                }}
                                spellCheck={false}
                                autoComplete="off"
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
