'use client'

import { useLibraryStore, TIME_LIMIT } from '@/hooks/use-library'
import { GameHUD, GameHUDState } from '@/components/ui/GameHUD'

export function LibraryHUD() {
    const { isActive, started, won, failed, timeLeft, startGame, resetGame } = useLibraryStore()

    let gameState: GameHUDState = 'idle'
    if (started) gameState = 'playing'
    if (won) gameState = 'won'
    if (failed) gameState = 'failed'

    return (
        <GameHUD
            isActive={isActive}
            gameState={gameState}
            onStart={started ? resetGame : startGame}
            title="Restricted Section"
            description={`Hold the cursed books to calm them down before they lose control! Survive for ${TIME_LIMIT} seconds to proceed.`}
            startLabel="Start Game"
            winTitle="Success!"
            winDescription="You survived the Restricted Section."
            winActionLabel="Play Again"
            failTitle="Chaos!"
            failDescription="A cursed book escaped."
            failActionLabel="Try Again"
            timeLeft={timeLeft}
            timeIcon="⏳"
        // No score for this one! Just survival.
        />
    )
}
