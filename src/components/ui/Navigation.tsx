'use client'

import { motion } from 'framer-motion'
import { Terminal, Scroll, Award, Settings } from 'lucide-react'

interface NavigationProps {
    onOpenTerminal: () => void
}

export function Navigation({ onOpenTerminal }: NavigationProps) {
    return (
        <motion.nav
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                padding: '1rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 100, // Above the 3D canvas overlay, below modals
                pointerEvents: 'none', // Let clicks fall through the empty space
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                    className="glass"
                    style={{
                        padding: '0.5rem 1rem',
                        fontFamily: "'Cinzel', serif",
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        color: '#d4af37',
                        textShadow: '0 0 10px rgba(212, 175, 55, 0.4)',
                        pointerEvents: 'auto'
                    }}
                >
                    Hogwarts
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', pointerEvents: 'auto' }}>
                <NavButton icon={<Scroll size={18} />} label="Quests" />
                <NavButton icon={<Award size={18} />} label="Artifacts" />
                <NavButton
                    icon={<Terminal size={18} />}
                    label="Terminal"
                    onClick={onOpenTerminal}
                    isActive={false} // Would be true if terminal is open
                />
                <NavButton icon={<Settings size={18} />} label="Settings" />
            </div>
        </motion.nav>
    )
}

function NavButton({ icon, label, onClick, isActive = false }: { icon: React.ReactNode, label: string, onClick?: () => void, isActive?: boolean }) {
    return (
        <button
            onClick={onClick}
            title={label}
            style={{
                background: isActive ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: isActive ? '1px solid rgba(212, 175, 55, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                color: isActive ? '#fffde7' : '#a0aab5',
                padding: '0.6rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'
                e.currentTarget.style.color = '#fff'
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.background = isActive ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.color = isActive ? '#fffde7' : '#a0aab5'
            }}
        >
            {icon}
        </button>
    )
}
