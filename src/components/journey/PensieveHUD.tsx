'use client'

import { useEffect } from 'react'
import { usePensieveStore, PENSIEVE_PAIRS } from '@/hooks/use-pensieve'

const glass: React.CSSProperties = {
    background: 'rgba(0,0,0,0.50)',
    backdropFilter: 'blur(8px)',
    borderRadius: '14px',
    border: '1px solid rgba(255,179,71,0.35)',
    fontFamily: "'Cinzel', serif",
    color: '#fff',
    textShadow: '0 2px 10px rgba(0,0,0,0.8)',
}

export function PensieveHUD() {
    const { isActive, phase, questions, currentIndex, answers, imageFlip, startGame, answer, resetGame } = usePensieveStore()

    // Preload current + next image to keep transitions smooth on slower networks (notably in prod).
    useEffect(() => {
        if (!isActive) return
        if (phase !== 'playing') return
        const q = questions[currentIndex]
        if (!q) return
        const curr = new Image()
        curr.src = q.imageUrl
        const next = questions[currentIndex + 1]
        if (next) {
            const nxt = new Image()
            nxt.src = next.imageUrl
        }
    }, [isActive, phase, questions, currentIndex])

    if (!isActive) return null

    const q = questions[currentIndex]
    const correctCount = answers.filter(Boolean).length
    const total = questions.length

    return (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, fontFamily: "'Cinzel', serif" }}>

            {/* ── IDLE ── */}
            {phase === 'idle' && (
                <div style={{
                    ...glass,
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%,-50%)',
                    width: 'clamp(320px,44vw,540px)',
                    padding: '38px', textAlign: 'center',
                }}>
                    <div style={{ fontSize: '56px', marginBottom: '8px' }}>🔮</div>
                    <h2 style={{ fontSize: 'clamp(20px,2.8vw,34px)', color: '#c8a0ff', textTransform: 'uppercase', letterSpacing: '4px', margin: '0 0 6px' }}>
                        The Pensieve
                    </h2>
                    <div style={{ borderBottom: '1px solid rgba(200,160,255,0.3)', margin: '14px 0 20px' }} />
                    <p style={{ fontSize: 'clamp(13px,1.3vw,16px)', opacity: 0.85, lineHeight: 1.8, marginBottom: '28px' }}>
                        {PENSIEVE_PAIRS.length} memories will surface.<br />
                        For each one, decide:<br />
                        <strong style={{ color: '#4aff88' }}>✓ Real</strong> — it truly happened in the Wizarding World,<br />
                        <strong style={{ color: '#ff4747' }}>✗ Fake</strong> — it was never in the books or films.
                    </p>
                    <button
                        onClick={startGame}
                        style={{
                            pointerEvents: 'auto', padding: '13px 36px',
                            fontSize: 'clamp(13px,1.4vw,17px)',
                            background: 'rgba(200,160,255,0.2)', border: '1px solid #c8a0ff',
                            color: '#c8a0ff', borderRadius: '6px', cursor: 'pointer',
                            fontFamily: "'Cinzel', serif", letterSpacing: '3px', textTransform: 'uppercase',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(200,160,255,0.35)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(200,160,255,0.2)')}
                    >
                        Enter the Pensieve
                    </button>
                </div>
            )}

            {/* ── PLAYING ── */}
            {phase === 'playing' && q && (
                <>
                    {/* Progress bar — top */}
                    <div style={{
                        position: 'absolute', top: '20px', left: '50%',
                        transform: 'translateX(-50%)',
                        display: 'flex', gap: '6px',
                    }}>
                        {questions.map((_, i) => (
                            <div key={i} style={{
                                width: '26px', height: '5px', borderRadius: '3px',
                                background: i < answers.length
                                    ? (answers[i] ? '#4aff88' : '#ff4747')
                                    : i === currentIndex ? '#fff' : 'rgba(255,255,255,0.2)',
                                transition: 'background 0.3s',
                            }} />
                        ))}
                    </div>

                    {/* Question label */}
                    <div style={{
                        position: 'absolute', top: '44px', left: '50%',
                        transform: 'translateX(-50%)',
                        ...glass, padding: '8px 24px',
                        fontSize: 'clamp(11px,1.2vw,14px)', letterSpacing: '2px',
                        textTransform: 'uppercase', opacity: 0.7, whiteSpace: 'nowrap',
                    }}>
                        {currentIndex + 1} / {total} — {q.label}
                    </div>

                    {/* Image + buttons — centred column */}
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -47%)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px',
                        width: 'clamp(280px,55vw,700px)',
                    }}>
                        {/* Image card */}
                        <div style={{
                            width: '100%',
                            ...glass,
                            padding: '12px',
                            transition: 'opacity 0.25s',
                            opacity: imageFlip ? 0 : 1,
                            border: `1px solid rgba(200,160,255,${imageFlip ? 0 : 0.35})`,
                        }}>
                            <img
                                src={q.imageUrl}
                                alt={q.label}
                                style={{ width: '100%', height: 'auto', maxHeight: '52vh', objectFit: 'contain', borderRadius: '8px', display: 'block' }}
                            />
                        </div>

                        {/* Answer buttons row — centred */}
                        <div style={{ display: 'flex', gap: '48px', alignItems: 'center' }}>
                            {/* REAL — green */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                <button
                                    onClick={() => answer(true)}
                                    style={{
                                        pointerEvents: imageFlip ? 'none' : 'auto',
                                        width: '72px', height: '72px', borderRadius: '50%',
                                        background: 'rgba(74,255,136,0.18)', border: '2px solid #4aff88',
                                        color: '#4aff88', fontSize: '32px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'background 0.2s, transform 0.15s',
                                        boxShadow: '0 0 18px rgba(74,255,136,0.35)',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(74,255,136,0.38)'; e.currentTarget.style.transform = 'scale(1.12)' }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(74,255,136,0.18)'; e.currentTarget.style.transform = 'scale(1)' }}
                                    title="Real — это было!"
                                >✓</button>
                                <span style={{ fontSize: '10px', opacity: 0.5, letterSpacing: '2px', textTransform: 'uppercase', color: '#4aff88' }}>Real</span>
                            </div>

                            {/* FAKE — red */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                <button
                                    onClick={() => answer(false)}
                                    style={{
                                        pointerEvents: imageFlip ? 'none' : 'auto',
                                        width: '72px', height: '72px', borderRadius: '50%',
                                        background: 'rgba(255,71,71,0.18)', border: '2px solid #ff4747',
                                        color: '#ff4747', fontSize: '32px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'background 0.2s, transform 0.15s',
                                        boxShadow: '0 0 18px rgba(255,71,71,0.35)',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,71,71,0.38)'; e.currentTarget.style.transform = 'scale(1.12)' }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,71,71,0.18)'; e.currentTarget.style.transform = 'scale(1)' }}
                                    title="Fake — этого не было!"
                                >✗</button>
                                <span style={{ fontSize: '10px', opacity: 0.5, letterSpacing: '2px', textTransform: 'uppercase', color: '#ff4747' }}>Fake</span>
                            </div>
                        </div>
                    </div>
                </>
            )}


            {/* ── RESULT ── */}
            {phase === 'result' && (
                <div style={{
                    ...glass,
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%,-50%)',
                    width: 'clamp(320px,46vw,560px)',
                    padding: '38px', textAlign: 'center',
                }}>
                    <div style={{ fontSize: '52px', marginBottom: '12px' }}>
                        {correctCount >= 8 ? '🏆' : correctCount >= 5 ? '⚗️' : '💀'}
                    </div>
                    <h2 style={{
                        fontSize: 'clamp(20px,2.8vw,32px)',
                        color: correctCount >= 8 ? '#ffd700' : correctCount >= 5 ? '#c8a0ff' : '#ff4747',
                        textTransform: 'uppercase', letterSpacing: '4px', margin: '0 0 6px',
                    }}>
                        {correctCount >= 8 ? 'Outstanding!' : correctCount >= 5 ? 'Acceptable' : 'Dreadful...'}
                    </h2>
                    <div style={{ borderBottom: '1px solid rgba(200,160,255,0.3)', margin: '14px 0 20px' }} />
                    <p style={{ fontSize: 'clamp(22px,3vw,38px)', marginBottom: '8px' }}>
                        <strong style={{ color: '#c8a0ff' }}>{correctCount}</strong>
                        <span style={{ opacity: 0.5, fontSize: '0.7em' }}> / {total}</span>
                    </p>

                    {/* Per-question breakdown */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '28px', textAlign: 'left' }}>
                        {questions.map((q, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'clamp(11px,1.1vw,13px)' }}>
                                <span style={{ color: answers[i] ? '#4aff88' : '#ff4747', fontSize: '16px' }}>
                                    {answers[i] ? '✓' : '✗'}
                                </span>
                                <span style={{ opacity: 0.8 }}>{q.label}</span>
                                <span style={{ marginLeft: 'auto', opacity: 0.45, fontSize: '10px' }}>
                                    {q.isReal ? 'real' : 'fake'}
                                </span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={resetGame}
                        style={{
                            pointerEvents: 'auto', padding: '13px 36px',
                            fontSize: 'clamp(13px,1.4vw,17px)',
                            background: 'rgba(200,160,255,0.2)', border: '1px solid #c8a0ff',
                            color: '#c8a0ff', borderRadius: '6px', cursor: 'pointer',
                            fontFamily: "'Cinzel', serif", letterSpacing: '3px', textTransform: 'uppercase',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(200,160,255,0.35)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(200,160,255,0.2)')}
                    >
                        Try Again
                    </button>
                </div>
            )}
        </div>
    )
}
