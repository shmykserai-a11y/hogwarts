'use client'

import { useSnapeCauldronStore, POTION_RECIPES, ALL_INGREDIENTS } from '@/hooks/use-snapecauldron'

const GLASS_PANEL: React.CSSProperties = {
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(4px)',
    border: '1px solid rgba(255,179,71,0.3)',
    borderRadius: '12px',
    color: '#fff',
    fontFamily: "'Cinzel', serif",
    textShadow: '0 2px 10px rgba(0,0,0,0.8)',
}

export function SnapeCauldronHUD() {
    const {
        isActive,
        isHintOpen,
        targetPotion,
        addedIngredients,
        gameState,
        brewProgress,
        toggleIngredient,
        closeHint,
        resetGame,
    } = useSnapeCauldronStore()

    if (!isActive) return null

    const recipeInfo = POTION_RECIPES[targetPotion]
    const isSuccess = gameState === 'success'
    const isFailure = gameState === 'failure'

    return (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, display: 'flex', alignItems: 'stretch' }}>

            {/* ── Hint Overlay (parchment) ── */}
            {isHintOpen && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'auto',
                        zIndex: 10000,
                    }}
                >
                    {/* backdrop */}
                    <div
                        onClick={closeHint}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'rgba(0,0,0,0.55)',
                            backdropFilter: 'blur(2px)',
                        }}
                    />

                    {/* parchment modal */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 'min(560px, 92vw)',
                        padding: '22px 22px 18px',
                        borderRadius: '16px',
                        border: '1px solid rgba(255,179,71,0.35)',
                        background: 'linear-gradient(180deg, rgba(245,232,200,0.96), rgba(225,205,160,0.96))',
                        color: '#1a1208',
                        boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
                        fontFamily: "'Cinzel', serif",
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                            <div>
                                <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', opacity: 0.75 }}>
                                    Potions Hint
                                </div>
                                <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '1px' }}>
                                    {recipeInfo.name}
                                </div>
                            </div>
                            <button
                                onClick={closeHint}
                                style={{
                                    pointerEvents: 'auto',
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    border: '1px solid rgba(26,18,8,0.25)',
                                    background: 'rgba(255,255,255,0.35)',
                                    cursor: 'pointer',
                                    fontSize: '18px',
                                    lineHeight: '34px',
                                    color: '#1a1208',
                                }}
                                aria-label="Close hint"
                                title="Close"
                            >
                                ×
                            </button>
                        </div>

                        <div style={{ height: '1px', background: 'rgba(26,18,8,0.18)', margin: '10px 0 14px' }} />

                        <div style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.7, marginBottom: '10px' }}>
                            Required Ingredients
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {recipeInfo.ingredients.map((reqId) => {
                                const ingDef = ALL_INGREDIENTS.find(i => i.id === reqId)
                                return (
                                    <div key={reqId} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <div style={{
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            background: '#3a2a14',
                                            opacity: 0.65,
                                            flexShrink: 0,
                                        }} />
                                        <div style={{ fontSize: '15px', fontStyle: 'italic' }}>
                                            {ingDef?.name || reqId}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                        {/*
                        <div style={{ marginTop: '16px', fontSize: '12px', opacity: 0.75, lineHeight: 1.6 }}>
                            Tip: click the parchment on the table again to hide this note.
                        </div>
                        */}
                    </div>
                </div>
            )}

            {/* ── LEFT: Ingredients Panel ── */}
            <div style={{
                ...GLASS_PANEL,
                position: 'absolute',
                top: '50%',
                left: '20px',
                transform: 'translateY(-50%)',
                width: 'clamp(200px, 22vw, 320px)',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '20px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
            }}>
                {/* Title */}
                <div style={{ color: '#ffb347', fontSize: 'clamp(12px, 1.4vw, 18px)', fontWeight: 'bold', letterSpacing: '3px', textAlign: 'center', borderBottom: '1px solid rgba(255,179,71,0.3)', paddingBottom: '10px' }}>
                    INGREDIENTS
                </div>

                {/* 3-column grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px',
                }}>
                    {ALL_INGREDIENTS.map(ing => {
                        const isSelected = addedIngredients.includes(ing.id)
                        return (
                            <button
                                key={ing.id}
                                onClick={() => toggleIngredient(ing.id)}
                                style={{
                                    pointerEvents: 'auto',
                                    cursor: 'pointer',
                                    background: isSelected ? 'rgba(255,179,71,0.25)' : 'rgba(255,255,255,0.05)',
                                    border: isSelected ? '2px solid rgba(255,179,71,0.9)' : '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '8px',
                                    padding: '6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'column',
                                    gap: '4px',
                                    transition: 'all 0.2s ease',
                                    boxShadow: isSelected ? '0 0 12px rgba(255,179,71,0.4)' : 'none',
                                    aspectRatio: '1',
                                    overflow: 'hidden',
                                    position: 'relative',
                                }}
                            >
                                {/* Ingredient Image */}
                                <img
                                    src={ing.url}
                                    alt={ing.name}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'contain',
                                        opacity: isSelected ? 0.7 : 1,
                                        transition: 'opacity 0.2s',
                                    }}
                                />
                                {/* Selected checkmark */}
                                {isSelected && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '4px',
                                        right: '4px',
                                        width: '14px',
                                        height: '14px',
                                        borderRadius: '50%',
                                        background: '#ffb347',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '9px',
                                        color: '#000',
                                        fontWeight: 'bold',
                                    }}>✓</div>
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* ingredient name tooltip text */}
                <div style={{ fontSize: '10px', opacity: 0.5, textAlign: 'center', letterSpacing: '1px' }}>
                    Click to select
                </div>
            </div>

            {/* ── RIGHT: Recipe Panel ── */}
            <div style={{
                ...GLASS_PANEL,
                position: 'absolute',
                top: '50%',
                right: '20px',
                transform: 'translateY(-50%)',
                width: 'clamp(240px, 26vw, 400px)',
                padding: '24px',
            }}>
                <h2 style={{ color: '#ffb347', fontSize: 'clamp(18px, 2vw, 28px)', fontWeight: 'bold', letterSpacing: '3px', textTransform: 'uppercase', textAlign: 'center', borderBottom: '1px solid rgba(255,179,71,0.3)', paddingBottom: '12px', margin: '0 0 16px 0' }}>
                    Potions Class
                </h2>

                <div style={{ marginBottom: '16px' }}>
                    <div style={{ color: '#ffb347', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', opacity: 0.8, marginBottom: '4px', textTransform: 'uppercase' }}>Recipe:</div>
                    <div style={{ fontSize: 'clamp(14px, 1.4vw, 18px)', fontStyle: 'italic', fontWeight: 'bold' }}>{recipeInfo.name}</div>
                </div>

                {/* Intentionally hide correctness/ingredient checklist here.
                    The player can open the parchment hint in-scene to see required ingredients. */}
                <div style={{
                    borderRadius: '10px',
                    border: '1px dashed rgba(255,179,71,0.35)',
                    padding: '14px 14px',
                    marginBottom: '18px',
                    opacity: 0.9,
                }}>
                    <div style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.8, marginBottom: '8px' }}>
                        Instructions
                    </div>
                    <div style={{ fontSize: '13px', lineHeight: 1.6, opacity: 0.92 }}>
                        Select ingredients on the left, then hold the cauldron for 3 seconds to brew.
                    </div>
                    {/*
                    <div style={{ fontSize: '12px', lineHeight: 1.6, opacity: 0.75, marginTop: '10px' }}>
                        Need a hint? Click the parchment on the table.
                    </div>
                    */}
                </div>

                {/* Brewing progress */}
                <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.6, marginBottom: '6px' }}>
                        Cauldron
                    </div>
                    <div style={{
                        height: '10px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,179,71,0.25)',
                        overflow: 'hidden',
                    }}>
                        <div style={{
                            height: '100%',
                            width: `${Math.round((gameState === 'brewing' ? brewProgress : gameState === 'success' || gameState === 'failure' ? 1 : 0) * 100)}%`,
                            background: gameState === 'failure'
                                ? 'linear-gradient(90deg, rgba(255,71,71,0.75), rgba(255,71,71,0.35))'
                                : 'linear-gradient(90deg, rgba(74,255,74,0.75), rgba(255,179,71,0.35))',
                            transition: 'width 0.12s linear',
                        }} />
                    </div>
                    <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.65 }}>
                        Selected: {addedIngredients.length}
                    </div>
                </div>

                {/* Status */}
                <div style={{ textAlign: 'center' }}>
                    {gameState === 'playing' && (
                        <div style={{ color: '#ffb347', opacity: 0.8, fontSize: '13px', fontStyle: 'italic', lineHeight: '1.5' }}>
                            Hold the cauldron for 3 seconds to brew.
                        </div>
                    )}
                    {gameState === 'brewing' && (
                        <div style={{ color: '#4aff4a', fontSize: '15px', fontWeight: 'bold', letterSpacing: '3px', animation: 'pulse 1s infinite' }}>
                            Brewing potion...
                        </div>
                    )}
                    {isSuccess && (
                        <div style={{ color: '#4aff4a', fontSize: '16px', fontWeight: 'bold', letterSpacing: '2px' }}>
                            Potion brewed successfully!
                        </div>
                    )}
                    {isFailure && (
                        <div style={{ color: '#ff4747', fontSize: '16px', fontWeight: 'bold', letterSpacing: '2px' }}>
                            Incorrect recipe!
                        </div>
                    )}
                </div>

                {/* Restart Button */}
                {(isSuccess || isFailure) && (
                    <button
                        onClick={resetGame}
                        style={{
                            pointerEvents: 'auto',
                            marginTop: '20px',
                            width: '100%',
                            padding: '12px',
                            borderRadius: '6px',
                            background: 'rgba(255,179,71,0.2)',
                            border: '1px solid #ffb347',
                            color: '#ffb347',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            letterSpacing: '3px',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            fontFamily: "'Cinzel', serif",
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,179,71,0.35)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,179,71,0.2)')}
                    >
                        Clear Cauldron
                    </button>
                )}
            </div>
        </div>
    )
}
