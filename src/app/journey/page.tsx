'use client'

import { PuzzleCanvasContainer } from '@/components/journey/PuzzleCanvasContainer'
import { usePuzzleScrollManager, TOTAL_PUZZLES } from '@/hooks/use-puzzle-scroll'
import { useStore } from '@/lib/store'
import { FruitNinjaHUD } from '@/components/journey/FruitNinjaHUD'
import { LibraryHUD } from '@/components/journey/LibraryHUD'
import { SnapeCauldronHUD } from '@/components/journey/SnapeCauldronHUD'
import { SortingHatHUD } from '@/components/journey/SortingHatHUD'
import { HagridsHutHUD } from '@/components/journey/HagridsHutHUD'
import { PensieveHUD } from '@/components/journey/PensieveHUD'
import { JOURNEY_SEQUENCE } from '@/config/journey-sequence'
import { Lock, Unlock } from 'lucide-react'
import { BackgroundMusic } from '@/components/ui/BackgroundMusic'

export default function JourneyPage() {
    // Attach event listeners for puzzle scrolling
    usePuzzleScrollManager()

    const { maxUnlockedIndex, puzzleLocationIndex, completedJourney } = useStore()

    const currentIdx = Math.round(puzzleLocationIndex)
    const meta = JOURNEY_SEQUENCE[currentIdx] ?? null
    const isGateHere = !!meta?.gated
    const isGateBlocking = isGateHere && currentIdx === maxUnlockedIndex && maxUnlockedIndex < TOTAL_PUZZLES - 1
    const isGateCleared = isGateHere && maxUnlockedIndex > currentIdx
    const isFinalGate = isGateHere && currentIdx === TOTAL_PUZZLES - 1
    const isFinalGateCleared = isFinalGate && !!(meta && completedJourney[meta.key])
    const isAtEnd = currentIdx >= TOTAL_PUZZLES - 1

    return (
        <main style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0e17' }}>
            {/* 3D Scene */}
            <PuzzleCanvasContainer />

            {/* HUD Overlay for the Journey */}
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0,
                pointerEvents: 'none',
                zIndex: 50,
                padding: '2rem',
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: "'Cinzel', serif",
                color: '#fff8e1',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}>
                {/* Centered current position indicator */}
                <div style={{
                    position: 'absolute',
                    top: '1.4rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '0.9rem',
                    opacity: 0.85,
                    letterSpacing: '0.6px',
                    whiteSpace: 'nowrap',
                }}>
                    {Math.min(Math.max(currentIdx + 1, 1), TOTAL_PUZZLES)} / {TOTAL_PUZZLES}
                </div>

                {/* Center stack under progression: music + scroll status */}
                <div style={{
                    position: 'absolute',
                    top: '2.6rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.55rem',
                    pointerEvents: 'auto',
                }}>
                    <BackgroundMusic />

                    {isGateBlocking && (
                        <div style={{
                            pointerEvents: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.45rem 0.6rem',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 204, 68, 0.35)',
                            background: 'rgba(10, 14, 23, 0.35)',
                            color: '#ffcc44',
                            fontSize: '0.8rem',
                            letterSpacing: '0.4px',
                            animation: 'pulseHint 2s infinite ease-in-out',
                        }}>
                            <Lock size={16} />
                            <span>{meta?.gateHint ?? 'Solve the challenge to continue'} ↓</span>
                        </div>
                    )}

                    {isAtEnd && (
                        <div style={{
                            pointerEvents: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.45rem 0.6rem',
                            borderRadius: '12px',
                            border: '1px solid rgba(0, 255, 170, 0.25)',
                            background: 'rgba(10, 14, 23, 0.30)',
                            color: 'rgba(210, 255, 240, 0.95)',
                            fontSize: '0.8rem',
                            letterSpacing: '0.4px',
                        }}>
                            <Unlock size={16} />
                            <span>Journey Complete</span>
                        </div>
                    )}

                    {!isGateBlocking && !isFinalGate && !isAtEnd && (
                        <div style={{
                            pointerEvents: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.45rem 0.6rem',
                            borderRadius: '12px',
                            border: '1px solid rgba(0, 255, 170, 0.25)',
                            background: 'rgba(10, 14, 23, 0.30)',
                            color: 'rgba(210, 255, 240, 0.9)',
                            fontSize: '0.8rem',
                            letterSpacing: '0.4px',
                        }}>
                            <Unlock size={16} />
                            <span>Unlocked. Scroll ↑</span>
                        </div>
                    )}

                    {isFinalGate && !isFinalGateCleared && (
                        <div style={{
                            pointerEvents: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.45rem 0.6rem',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 204, 68, 0.35)',
                            background: 'rgba(10, 14, 23, 0.35)',
                            color: '#ffcc44',
                            fontSize: '0.8rem',
                            letterSpacing: '0.4px',
                        }}>
                            <Lock size={16} />
                            <span>{meta?.gateHint ?? 'Complete the final challenge'}</span>
                        </div>
                    )}

                    {isFinalGate && isFinalGateCleared && (
                        <div style={{
                            pointerEvents: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.45rem 0.6rem',
                            borderRadius: '12px',
                            border: '1px solid rgba(0, 255, 170, 0.25)',
                            background: 'rgba(10, 14, 23, 0.30)',
                            color: 'rgba(210, 255, 240, 0.9)',
                            fontSize: '0.8rem',
                            letterSpacing: '0.4px',
                        }}>
                            <Unlock size={16} />
                            <span>Completed</span>
                        </div>
                    )}
                </div>

                <div>
                    <h1 style={{ fontSize: '1.2rem', margin: 0, opacity: 0.9 }}>Journey to Hogwarts</h1>
                    <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: '0.2rem 0 0 0', textTransform: 'uppercase', letterSpacing: '2px' }}>
                        Puzzle
                    </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                </div>
            </div>

            {/* Native 2D HUD globally synced to Fruit Ninja Zustand state */}
            <FruitNinjaHUD />
            <LibraryHUD />
            <SnapeCauldronHUD />
            <SortingHatHUD />
            <HagridsHutHUD />
            <PensieveHUD />

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes pulseHint {
                    0% { opacity: 0.4; }
                    50% { opacity: 1; text-shadow: 0 0 10px rgba(255, 204, 68, 0.6); }
                    100% { opacity: 0.4; }
                }
            `}} />
        </main>
    )
}
