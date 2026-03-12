'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'
import { X, Code2 } from 'lucide-react'

export function JsSpellsOverlay() {
    const { isJsSpellsOpen, setJsSpellsOpen, setLumosActive, isLumosActive } = useStore()
    const [input, setInput] = useState('')
    const [history, setHistory] = useState<{ id: number, text: string, type: 'in' | 'out' | 'error' }[]>([
        { id: 1, text: '// Welcome to The Code Grimoire.', type: 'out' },
        { id: 2, text: '// Try a basic spell: lumos() or nox()', type: 'out' }
    ])

    const handleExecute = (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return

        const command = input.trim()
        const newHistory = [...history, { id: Date.now(), text: `> ${command}`, type: 'in' as const }]

        // Very basic "spell parser"
        if (command === 'lumos()') {
            setLumosActive(true)
            newHistory.push({ id: Date.now() + 1, text: 'Spell executed: The darkness recedes.', type: 'out' })
        } else if (command === 'nox()') {
            setLumosActive(false)
            newHistory.push({ id: Date.now() + 1, text: 'Spell executed: The shadows return.', type: 'out' })
        } else if (command === 'clear()') {
            setHistory([])
            setInput('')
            return
        } else {
            newHistory.push({ id: Date.now() + 1, text: `ReferenceError: Spell '${command}' is not defined.`, type: 'error' })
        }

        setHistory(newHistory)
        setInput('')
    }

    return (
        <AnimatePresence>
            {isJsSpellsOpen && (
                <motion.div
                    className="glass"
                    initial={{ opacity: 0, scale: 0.9, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 50 }}
                    style={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        width: '400px',
                        height: '350px',
                        zIndex: 150, // Above canvas, below acceptance letter
                        background: 'rgba(20, 25, 30, 0.85)',
                        border: `1px solid ${isLumosActive ? '#d4af37' : '#333'}`,
                        borderRadius: '8px',
                        boxShadow: `0 10px 30px rgba(0,0,0,0.5)${isLumosActive ? ', 0 0 20px rgba(212, 175, 55, 0.2)' : ''}`,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        fontFamily: 'monospace'
                    }}
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.8rem 1rem',
                        background: 'rgba(0,0,0,0.4)',
                        borderBottom: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c0a87d' }}>
                            <Code2 size={16} />
                            <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>JS_SPELLS.exe</span>
                        </div>
                        <button
                            onClick={() => setJsSpellsOpen(false)}
                            style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Output Area */}
                    <div style={{
                        flex: 1,
                        padding: '1rem',
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        fontSize: '0.9rem'
                    }}>
                        {history.map(line => (
                            <div key={line.id} style={{
                                color: line.type === 'in' ? '#fff' : line.type === 'error' ? '#ff5555' : '#8be9fd'
                            }}>
                                {line.text}
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleExecute} style={{ padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.4)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ color: '#50fa7b', marginRight: '8px' }}>~</span>
                            <input
                                autoFocus
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a spell..."
                                spellCheck="false"
                                style={{
                                    flex: 1,
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#f8f8f2',
                                    outline: 'none',
                                    fontFamily: 'monospace',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
