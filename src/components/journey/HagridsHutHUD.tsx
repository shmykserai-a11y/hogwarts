'use client'

import { useEffect } from 'react'
import { useHagridsHutStore, HUT_ITEMS, TIME_LIMIT } from '@/hooks/use-hagrids-hut'

const glass: React.CSSProperties = {
    background: 'rgba(0,0,0,0.45)',
    backdropFilter: 'blur(6px)',
    borderRadius: '14px',
    border: '1px solid rgba(255,179,71,0.35)',
    fontFamily: "'Cinzel', serif",
    color: '#fff',
    textShadow: '0 2px 10px rgba(0,0,0,0.8)',
}

function GoldBtn({ onClick, children, color = '#ffb347', bg = 'rgba(255,179,71,0.2)' }: {
    onClick: () => void; children: React.ReactNode; color?: string; bg?: string
}) {
    return (
        <button
            onClick={onClick}
            style={{
                pointerEvents: 'auto', padding: '13px 34px',
                fontSize: 'clamp(13px,1.4vw,17px)',
                background: bg, border: `1px solid ${color}`, color,
                borderRadius: '6px', cursor: 'pointer',
                fontFamily: "'Cinzel', serif", letterSpacing: '3px',
                textTransform: 'uppercase', transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,179,71,0.35)')}
            onMouseLeave={e => (e.currentTarget.style.background = bg)}
        >{children}</button>
    )
}

export function HagridsHutHUD() {
    const { isActive, phase, timeLeft, order, currentIndex, foundIds, wrongFlash, startGame, resetGame, tick } = useHagridsHutStore()

    // Countdown timer
    useEffect(() => {
        if (phase !== 'playing') return
        const t = setInterval(tick, 1000)
        return () => clearInterval(t)
    }, [phase, tick])

    if (!isActive) return null

    const target = order[currentIndex]
    const timerDanger = timeLeft <= 10
    const progress = foundIds.length / HUT_ITEMS.length

    return (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, fontFamily: "'Cinzel', serif" }}>

            {/* ── IDLE ── */}
            {phase === 'idle' && (
                <div style={{
                    ...glass,
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%,-50%)',
                    width: 'clamp(320px,42vw,520px)',
                    padding: '36px', textAlign: 'center',
                }}>
                    <div style={{ fontSize: '52px', marginBottom: '8px' }}>🏠</div>
                    <h2 style={{ fontSize: 'clamp(20px,2.8vw,34px)', color: '#ffb347', textTransform: 'uppercase', letterSpacing: '4px', margin: '0 0 6px' }}>
                        Hagrid's Hut
                    </h2>
                    <div style={{ borderBottom: '1px solid rgba(255,179,71,0.3)', margin: '14px 0 20px' }} />
                    <p style={{ fontSize: 'clamp(13px,1.3vw,16px)', opacity: 0.85, lineHeight: 1.7, marginBottom: '24px' }}>
                        Search the cabin for hidden objects.<br />
                        Find all <strong>{HUT_ITEMS.length}</strong> items within <strong>{TIME_LIMIT} seconds</strong>!
                    </p>
                    <GoldBtn onClick={startGame}>Search the Hut</GoldBtn>
                </div>
            )}

            {/* ── PLAYING ── */}
            {phase === 'playing' && target && (
                <>
                    {/* Target item banner — top center */}
                    <div style={{
                        ...glass,
                        position: 'absolute', top: '20px', left: '50%',
                        transform: 'translateX(-50%)',
                        padding: '14px 32px',
                        display: 'flex', alignItems: 'center', gap: '16px',
                        animation: wrongFlash ? 'hutShake 0.4s ease' : undefined,
                        borderColor: wrongFlash ? 'rgba(255,71,71,0.7)' : 'rgba(255,179,71,0.35)',
                        transition: 'border-color 0.2s',
                    }}>
                        <div style={{ fontSize: '30px' }}>{target.emoji}</div>
                        <div>
                            <div style={{ fontSize: '10px', letterSpacing: '3px', opacity: 0.55, textTransform: 'uppercase', marginBottom: '2px' }}>Find:</div>
                            <div style={{
                                fontSize: 'clamp(16px,2vw,22px)', fontWeight: 'bold',
                                color: wrongFlash ? '#ff6666' : '#fff',
                                transition: 'color 0.2s',
                            }}>
                                {target.label}
                            </div>
                        </div>

                        {/* Progress dots */}
                        <div style={{ display: 'flex', gap: '5px', marginLeft: '8px' }}>
                            {HUT_ITEMS.map((_, i) => (
                                <div key={i} style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    background: i < foundIds.length ? '#ffb347'
                                        : i === currentIndex ? '#fff' : 'rgba(255,255,255,0.2)',
                                    transition: 'background 0.3s',
                                }} />
                            ))}
                        </div>
                    </div>

                    {/* Timer — bottom left */}
                    <div style={{
                        ...glass,
                        position: 'absolute', bottom: '36px', left: '36px',
                        padding: '10px 20px',
                        fontSize: '28px', fontWeight: 'bold',
                        color: timerDanger ? '#ff4747' : '#fff',
                        animation: timerDanger ? 'hutPulse 0.8s infinite' : undefined,
                        borderColor: timerDanger ? 'rgba(255,71,71,0.5)' : 'rgba(255,179,71,0.3)',
                    }}>
                        ⏳ {timeLeft}s
                    </div>

                    {/* Score — bottom right */}
                    <div style={{
                        ...glass,
                        position: 'absolute', bottom: '36px', right: '36px',
                        padding: '10px 20px',
                        fontSize: '20px', color: '#ffb347',
                    }}>
                        🔍 {foundIds.length} / {HUT_ITEMS.length}
                    </div>
                </>
            )}

            {/* ── WON ── */}
            {phase === 'won' && (
                <div style={{
                    ...glass,
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%,-50%)',
                    width: 'clamp(320px,42vw,520px)',
                    padding: '36px', textAlign: 'center',
                }}>
                    <div style={{ fontSize: '52px', marginBottom: '12px' }}>🎉</div>
                    <h2 style={{ fontSize: 'clamp(20px,2.8vw,32px)', color: '#4aff4a', textTransform: 'uppercase', letterSpacing: '4px', margin: '0 0 6px' }}>
                        Well Done!
                    </h2>
                    <div style={{ borderBottom: '1px solid rgba(74,255,74,0.3)', margin: '14px 0 20px' }} />
                    <p style={{ fontSize: 'clamp(13px,1.3vw,16px)', lineHeight: 1.8, opacity: 0.9, marginBottom: '8px' }}>
                        You found all {HUT_ITEMS.length} objects with <strong style={{ color: '#ffb347' }}>{timeLeft}s</strong> to spare!
                    </p>
                    <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '24px', fontStyle: 'italic' }}>
                        "You're a natural, yeh are!" — Hagrid
                    </p>
                    <GoldBtn onClick={resetGame} color="#4aff4a" bg="rgba(74,255,74,0.15)">
                        Search Again
                    </GoldBtn>
                </div>
            )}

            {/* ── FAILED ── */}
            {phase === 'failed' && (
                <div style={{
                    ...glass,
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%,-50%)',
                    width: 'clamp(320px,42vw,520px)',
                    padding: '36px', textAlign: 'center',
                }}>
                    <div style={{ fontSize: '52px', marginBottom: '12px' }}>⌛</div>
                    <h2 style={{ fontSize: 'clamp(20px,2.8vw,32px)', color: '#ff4747', textTransform: 'uppercase', letterSpacing: '4px', margin: '0 0 6px' }}>
                        Time's Up!
                    </h2>
                    <div style={{ borderBottom: '1px solid rgba(255,71,71,0.3)', margin: '14px 0 20px' }} />
                    <p style={{ fontSize: 'clamp(13px,1.3vw,16px)', lineHeight: 1.8, opacity: 0.9, marginBottom: '24px' }}>
                        You found <strong style={{ color: '#ffb347' }}>{foundIds.length}</strong> of {HUT_ITEMS.length} objects.<br />
                        <span style={{ fontStyle: 'italic', opacity: 0.7 }}>Look more carefully next time!</span>
                    </p>
                    <GoldBtn onClick={resetGame} color="#ff4747" bg="rgba(255,71,71,0.15)">
                        Try Again
                    </GoldBtn>
                </div>
            )}

            <style>{`
                @keyframes hutShake {
                    0%,100% { transform: translateX(-50%) }
                    20% { transform: translateX(calc(-50% - 8px)) }
                    40% { transform: translateX(calc(-50% + 8px)) }
                    60% { transform: translateX(calc(-50% - 6px)) }
                    80% { transform: translateX(calc(-50% + 4px)) }
                }
                @keyframes hutPulse {
                    0%,100% { opacity: 1 }
                    50% { opacity: 0.5 }
                }
            `}</style>
        </div>
    )
}
