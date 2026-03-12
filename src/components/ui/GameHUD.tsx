import React, { ReactNode } from 'react'

export type GameHUDState = 'idle' | 'playing' | 'won' | 'failed'

export interface GameHUDProps {
    isActive: boolean
    gameState: GameHUDState

    // Actions
    onStart: () => void

    // Idle / Start Menu
    title: string
    description: string | ReactNode
    startLabel?: string

    // Win Menu
    winTitle?: string
    winDescription?: string | ReactNode
    winActionLabel?: string

    // Fail Menu
    failTitle?: string
    failDescription?: string | ReactNode
    failActionLabel?: string

    // Corner Elements (Bottom Left / Bottom Right)
    timeLeft?: number
    timeIcon?: string

    score?: number
    maxScore?: number
    scoreIcon?: string

    // Use for entirely custom bottom-corners if needed
    bottomLeftOverride?: ReactNode
    bottomRightOverride?: ReactNode
}

// ─── Shared glass panel style (matches SnapeCauldronHUD) ─────────────────────
const panelStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#fff',
    textAlign: 'center',
    textShadow: '0 2px 10px rgba(0,0,0,0.8)',
    width: 'clamp(320px, 42vw, 560px)',
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(4px)',
    borderRadius: '12px',
    border: '1px solid rgba(255,179,71,0.3)',
    padding: '32px 36px',
    fontFamily: "'Cinzel', serif",
}

const titleStyle: React.CSSProperties = {
    fontSize: 'clamp(22px, 3vw, 38px)',
    margin: '0 0 0 0',
    color: '#ffb347',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '4px',
}

const dividerStyle: React.CSSProperties = {
    borderBottom: '1px solid rgba(255,179,71,0.3)',
    margin: '14px 0 20px 0',
}

const descStyle: React.CSSProperties = {
    margin: '0 0 24px 0',
    fontSize: 'clamp(14px, 1.5vw, 18px)',
    lineHeight: 1.6,
    opacity: 0.85,
}

function GoldButton({ onClick, color = '#ffb347', bg = 'rgba(255,179,71,0.2)', children }: {
    onClick: () => void
    color?: string
    bg?: string
    children: ReactNode
}) {
    return (
        <button
            onClick={onClick}
            style={{
                pointerEvents: 'auto',
                padding: '13px 32px',
                fontSize: 'clamp(14px, 1.5vw, 18px)',
                background: bg,
                border: `1px solid ${color}`,
                color,
                borderRadius: '6px',
                cursor: 'pointer',
                fontFamily: "'Cinzel', serif",
                letterSpacing: '2px',
                textTransform: 'uppercase',
                transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = color.replace(')', ',0.35)').replace('rgb', 'rgba'))}
            onMouseLeave={e => (e.currentTarget.style.background = bg)}
        >
            {children}
        </button>
    )
}

export function GameHUD({
    isActive,
    gameState,
    onStart,

    title,
    description,
    startLabel = "Start Game",

    winTitle = "Success!",
    winDescription = "Challenge Complete.",
    winActionLabel = "Play Again",

    failTitle = "Time's Up!",
    failDescription = "You have failed the challenge.",
    failActionLabel = "Try Again",

    timeLeft,
    timeIcon = "⏱️",

    score,
    maxScore,
    scoreIcon = "🎯",

    bottomLeftOverride,
    bottomRightOverride
}: GameHUDProps) {

    if (!isActive) return null

    const showMenu = gameState !== 'playing'

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 100,
            fontFamily: "'Cinzel', serif"
        }}>
            {/* ── Center Menu Panel ── */}
            {showMenu && (
                <div style={panelStyle}>

                    {gameState === 'idle' && (
                        <>
                            <h2 style={titleStyle}>{title}</h2>
                            <div style={dividerStyle} />
                            <div style={descStyle}>{description}</div>
                            <GoldButton onClick={onStart}>{startLabel}</GoldButton>
                        </>
                    )}

                    {gameState === 'won' && (
                        <>
                            <h2 style={{ ...titleStyle, color: '#4aff4a' }}>{winTitle}</h2>
                            <div style={{ ...dividerStyle, borderColor: 'rgba(74,255,74,0.3)' }} />
                            <div style={descStyle}>{winDescription}</div>
                            <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '20px', letterSpacing: '1px' }}>
                                Scroll down to continue...
                            </div>
                            <GoldButton onClick={onStart} color="#4aff4a" bg="rgba(74,255,74,0.15)">
                                {winActionLabel}
                            </GoldButton>
                        </>
                    )}

                    {gameState === 'failed' && (
                        <>
                            <h2 style={{ ...titleStyle, color: '#ff4747' }}>{failTitle}</h2>
                            <div style={{ ...dividerStyle, borderColor: 'rgba(255,71,71,0.3)' }} />
                            <div style={descStyle}>{failDescription}</div>
                            <GoldButton onClick={onStart} color="#ff4747" bg="rgba(255,71,71,0.15)">
                                {failActionLabel}
                            </GoldButton>
                        </>
                    )}
                </div>
            )}

            {/* ── Corner HUD (while playing) ── */}
            {gameState === 'playing' && (
                <>
                    {bottomLeftOverride ? (
                        <div style={{ position: 'absolute', bottom: '40px', left: '40px' }}>
                            {bottomLeftOverride}
                        </div>
                    ) : (
                        timeLeft !== undefined && (
                            <div style={{
                                position: 'absolute',
                                bottom: '40px',
                                left: '40px',
                                fontSize: '32px',
                                fontWeight: 'bold',
                                color: timeLeft <= 10 ? '#ff4747' : '#fff',
                                textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                                background: 'rgba(0,0,0,0.35)',
                                backdropFilter: 'blur(4px)',
                                border: '1px solid rgba(255,179,71,0.25)',
                                borderRadius: '8px',
                                padding: '8px 18px',
                            }}>
                                {timeIcon} {timeLeft}s
                            </div>
                        )
                    )}

                    {bottomRightOverride ? (
                        <div style={{ position: 'absolute', bottom: '40px', right: '40px' }}>
                            {bottomRightOverride}
                        </div>
                    ) : (
                        score !== undefined && maxScore !== undefined && (
                            <div style={{
                                position: 'absolute',
                                bottom: '40px',
                                right: '40px',
                                fontSize: '32px',
                                fontWeight: 'bold',
                                color: '#ffb347',
                                textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                                background: 'rgba(0,0,0,0.35)',
                                backdropFilter: 'blur(4px)',
                                border: '1px solid rgba(255,179,71,0.25)',
                                borderRadius: '8px',
                                padding: '8px 18px',
                            }}>
                                {scoreIcon} {score}/{maxScore}
                            </div>
                        )
                    )}
                </>
            )}
        </div>
    )
}
