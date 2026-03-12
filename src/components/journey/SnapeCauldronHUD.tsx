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
    const { isActive, targetPotion, addedIngredients, gameState, toggleIngredient, resetGame } = useSnapeCauldronStore()

    if (!isActive) return null

    const recipeInfo = POTION_RECIPES[targetPotion]
    const isSuccess = gameState === 'success'
    const isFailure = gameState === 'failure'

    return (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999, display: 'flex', alignItems: 'stretch' }}>

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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    {recipeInfo.ingredients.map(reqId => {
                        const ingDef = ALL_INGREDIENTS.find(i => i.id === reqId)
                        const isAdded = addedIngredients.includes(reqId)
                        return (
                            <div key={reqId} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '50%',
                                    border: `2px solid ${isAdded ? '#4aff4a' : 'rgba(255,179,71,0.5)'}`,
                                    background: isAdded ? 'rgba(74,255,74,0.3)' : 'transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    boxShadow: isAdded ? '0 0 8px #4aff4a' : 'none',
                                    transition: 'all 0.3s',
                                }}>
                                    {isAdded && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4aff4a' }} />}
                                </div>
                                <span style={{
                                    fontSize: 'clamp(12px, 1.1vw, 15px)',
                                    color: isAdded ? '#4aff4a' : '#fff',
                                    textDecoration: isAdded ? 'line-through' : 'none',
                                    opacity: isAdded ? 0.7 : 1,
                                    transition: 'all 0.3s',
                                }}>
                                    {ingDef?.name || reqId}
                                </span>
                            </div>
                        )
                    })}
                </div>

                {/* Status */}
                <div style={{ textAlign: 'center' }}>
                    {gameState === 'playing' && (
                        <div style={{ color: '#ffb347', opacity: 0.8, fontSize: '13px', fontStyle: 'italic', lineHeight: '1.5' }}>
                            Select ingredients and hold the cauldron for 3 seconds.
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
