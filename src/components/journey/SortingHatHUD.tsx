'use client'

import { useState } from 'react'
import { useSortingHatStore, HOUSE_META, QUESTIONS, House } from '@/hooks/use-sortinghat'

// ── Shared glass panel (same as SnapeCauldronHUD) ───────────────────────────
const glass: React.CSSProperties = {
    background: 'rgba(0,0,0,0.45)',
    backdropFilter: 'blur(6px)',
    borderRadius: '14px',
    border: '1px solid rgba(255,179,71,0.35)',
    fontFamily: "'Cinzel', serif",
    color: '#fff',
    textShadow: '0 2px 10px rgba(0,0,0,0.8)',
}

const RIGHT_GUTTER_BADGE_POS: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: 'calc(75vw + (clamp(340px, 52vw, 680px) / 4))',
    transform: 'translate(-50%, -50%)',
}

function HouseChip({ house }: { house: House }) {
    const meta = HOUSE_META[house]
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 14px',
            borderRadius: '20px',
            background: meta.color + '33',
            border: `1px solid ${meta.color}88`,
            color: meta.color,
            fontSize: '13px',
            fontWeight: 'bold',
            letterSpacing: '2px',
            textTransform: 'uppercase',
        }}>
            {meta.emoji} {meta.name}
        </span>
    )
}

function AssignedHouseBadge({ house, footer }: { house: House; footer?: React.ReactNode }) {
    const meta = HOUSE_META[house]
    return (
        <div style={{
            ...glass,
            ...RIGHT_GUTTER_BADGE_POS,
            padding: '12px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            minWidth: '160px',
        }}>
            <div style={{ fontSize: '11px', letterSpacing: '2px', opacity: 0.6, textTransform: 'uppercase' }}>
                Assigned House
            </div>
            <div style={{ fontSize: '28px' }}>{meta.emoji}</div>
            <div style={{ color: meta.color, fontWeight: 'bold', letterSpacing: '2px', fontSize: '14px', textTransform: 'uppercase' }}>
                {meta.name}
            </div>
            <div style={{ fontSize: '10px', opacity: 0.5, fontStyle: 'italic', textAlign: 'center' }}>
                {meta.traits}
            </div>
            {footer ? (
                <div style={{ marginTop: '4px', fontSize: '11px', opacity: 0.6 }}>
                    {footer}
                </div>
            ) : null}
        </div>
    )
}

function AnswerButton({ text, onClick, selected }: { text: string; onClick: () => void; selected?: boolean }) {
    const [hovered, setHovered] = useState(false)
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                width: '100%',
                padding: '12px 16px',
                textAlign: 'left',
                background: selected
                    ? 'rgba(255,179,71,0.25)'
                    : hovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
                border: selected
                    ? '1px solid rgba(255,179,71,0.9)'
                    : '1px solid rgba(255,255,255,0.15)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: 'clamp(12px, 1.2vw, 15px)',
                fontFamily: "'Cinzel', serif",
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                lineHeight: 1.5,
                pointerEvents: 'auto',
                boxShadow: selected ? '0 0 12px rgba(255,179,71,0.3)' : 'none',
            }}
        >
            {text}
        </button>
    )
}

export function SortingHatHUD() {
    const {
        isActive, targetHouse, phase, currentQuestion, answers,
        startGame, answerQuestion, resetGame
    } = useSortingHatStore()

    if (!isActive) return null

    const houseMeta = HOUSE_META[targetHouse]
    const question = QUESTIONS[currentQuestion]

    // Count how many answers matched the target house
    const correctCount = answers.filter(a => a === targetHouse).length
    const passed = correctCount >= 3

    return (
        <div style={{
            position: 'fixed', inset: 0,
            pointerEvents: 'none',
            zIndex: 9999,
            fontFamily: "'Cinzel', serif",
        }}>

            {(phase === 'questioning' || phase === 'verdict') && (
                <AssignedHouseBadge
                    house={targetHouse}
                    footer={phase === 'questioning' ? (<>{currentQuestion + 1} / {QUESTIONS.length}</>) : undefined}
                />
            )}

            {/* ── IDLE: Start Screen ── */}
            {phase === 'idle' && (
                <div style={{
                    ...glass,
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 'clamp(320px, 42vw, 520px)',
                    padding: '36px',
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '8px' }}>🎩</div>
                    <h2 style={{
                        fontSize: 'clamp(20px, 2.8vw, 34px)',
                        color: '#ffb347',
                        textTransform: 'uppercase',
                        letterSpacing: '4px',
                        margin: '0 0 6px 0',
                    }}>
                        The Sorting Hat
                    </h2>
                    <div style={{ borderBottom: '1px solid rgba(255,179,71,0.3)', margin: '14px 0 20px' }} />

                    <p style={{ fontSize: 'clamp(13px, 1.3vw, 16px)', opacity: 0.85, lineHeight: 1.7, marginBottom: '20px' }}>
                        The Hat has chosen your house.
                        Answer five questions as a true member of that house would.
                        The Hat will judge whether you belong.
                    </p>

                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ fontSize: '12px', opacity: 0.5, letterSpacing: '2px', marginBottom: '8px', textTransform: 'uppercase' }}>
                            Your House
                        </div>
                        <HouseChip house={targetHouse} />
                    </div>

                    <button
                        onClick={startGame}
                        style={{
                            pointerEvents: 'auto',
                            padding: '13px 36px',
                            fontSize: 'clamp(13px, 1.4vw, 17px)',
                            background: 'rgba(255,179,71,0.2)',
                            border: '1px solid #ffb347',
                            color: '#ffb347',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontFamily: "'Cinzel', serif",
                            letterSpacing: '3px',
                            textTransform: 'uppercase',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,179,71,0.35)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,179,71,0.2)')}
                    >
                        Put On The Hat
                    </button>
                </div>
            )}

            {/* ── QUESTIONING: Question Panel ── */}
            {phase === 'questioning' && (
                <>
                    <div style={{
                        ...glass,
                        position: 'absolute',
                        top: '50%', left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 'clamp(340px, 52vw, 680px)',
                        padding: '32px 36px',
                    }}>
                        {/* Progress dots */}
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '20px' }}>
                            {QUESTIONS.map((_, i) => (
                                <div key={i} style={{
                                    width: '8px', height: '8px', borderRadius: '50%',
                                    background: i < currentQuestion
                                        ? '#ffb347'
                                        : i === currentQuestion
                                            ? '#fff'
                                            : 'rgba(255,255,255,0.2)',
                                    transition: 'background 0.3s',
                                }} />
                            ))}
                        </div>

                        <div style={{ color: '#ffb347', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '6px', opacity: 0.8 }}>
                            Question {currentQuestion + 1} of {QUESTIONS.length}
                        </div>
                        <h3 style={{ fontSize: 'clamp(16px, 2vw, 22px)', margin: '0 0 2px 0', color: '#fff', fontWeight: 'bold' }}>
                            {question.title}
                        </h3>
                        <div style={{ borderBottom: '1px solid rgba(255,179,71,0.25)', margin: '12px 0 16px' }} />

                        <p style={{ fontSize: 'clamp(12px, 1.2vw, 15px)', lineHeight: 1.7, opacity: 0.85, marginBottom: '20px', fontStyle: 'italic' }}>
                            {question.situation}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {question.options.map((opt, i) => (
                                <AnswerButton
                                    key={i}
                                    text={opt.text}
                                    onClick={() => answerQuestion(opt.house)}
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}

            {/* ── VERDICT: Final Screen ── */}
            {phase === 'verdict' && (
                <div style={{
                    ...glass,
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 'clamp(320px, 44vw, 560px)',
                    padding: '36px',
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: '52px', marginBottom: '12px' }}>
                        {passed ? '🎩✨' : '🎩💨'}
                    </div>

                    <h2 style={{
                        fontSize: 'clamp(20px, 2.8vw, 32px)',
                        color: passed ? '#4aff4a' : '#ff4747',
                        textTransform: 'uppercase',
                        letterSpacing: '4px',
                        margin: '0 0 6px 0',
                    }}>
                        {passed ? 'Sorted!' : 'Not Quite...'}
                    </h2>

                    <div style={{ borderBottom: `1px solid ${passed ? 'rgba(74,255,74,0.3)' : 'rgba(255,71,71,0.3)'}`, margin: '14px 0 20px' }} />

                    <div style={{ marginBottom: '16px' }}>
                        <HouseChip house={targetHouse} />
                    </div>

                    <p style={{ fontSize: 'clamp(13px, 1.3vw, 16px)', lineHeight: 1.8, opacity: 0.9, marginBottom: '12px' }}>
                        {passed
                            ? `Excellent! ${correctCount} out of ${QUESTIONS.length} answers were worthy of a true ${houseMeta.name} student. The Hat has spoken — you belong here.`
                            : `Hmm... only ${correctCount} out of ${QUESTIONS.length} answers reflected the spirit of ${houseMeta.name}. A true member acts differently. Try again!`
                        }
                    </p>

                    <div style={{ fontSize: '13px', color: '#ffb347', fontStyle: 'italic', opacity: 0.7, marginBottom: '24px' }}>
                        "{passed
                            ? `I see ${houseMeta.traits.toLowerCase()} in you. ${houseMeta.name}!`
                            : `Study the ways of ${houseMeta.name}. Come back when you're ready.`}"
                    </div>

                    {/* Per-question breakdown */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                        {answers.map((ans, i) => (
                            <div key={i} style={{
                                width: '28px', height: '28px', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '14px',
                                background: ans === targetHouse ? 'rgba(74,255,74,0.2)' : 'rgba(255,71,71,0.15)',
                                border: `1px solid ${ans === targetHouse ? '#4aff4a' : '#ff4747'}`,
                            }}>
                                {ans === targetHouse ? '✓' : '✗'}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={resetGame}
                        style={{
                            pointerEvents: 'auto',
                            padding: '13px 32px',
                            fontSize: 'clamp(12px, 1.3vw, 16px)',
                            background: 'rgba(255,179,71,0.18)',
                            border: '1px solid #ffb347',
                            color: '#ffb347',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontFamily: "'Cinzel', serif",
                            letterSpacing: '3px',
                            textTransform: 'uppercase',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,179,71,0.33)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,179,71,0.18)')}
                    >
                        Try Again
                    </button>
                </div>
            )}
        </div>
    )
}
