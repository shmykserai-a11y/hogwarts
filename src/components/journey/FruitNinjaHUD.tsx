'use client'

import { useFruitNinjaStore, TOTAL_TO_WIN } from '@/hooks/use-fruitninja'
import { GameHUD, GameHUDState } from '@/components/ui/GameHUD'

export function FruitNinjaHUD() {
    const { isActive, started, won, failed, score, timeLeft, startGame } = useFruitNinjaStore()

    let gameState: GameHUDState = 'idle'
    if (started) gameState = 'playing'
    if (won) gameState = 'won'
    if (failed) gameState = 'failed'

    return (
        <GameHUD
            isActive={isActive}
            gameState={gameState}
            onStart={startGame}
            title="Catch the Candles!"
            description={`Catch ${TOTAL_TO_WIN} candles before time runs out to proceed.`}
            startLabel="Start Game"
            winTitle="Success!"
            winDescription={<>The Great Hall is lit.</>}
            winActionLabel="Play Again"
            failTitle="Time's Up!"
            failDescription="The candles slipped away."
            failActionLabel="Try Again"
            timeLeft={timeLeft}
            timeIcon="⏱️"
            score={score}
            maxScore={TOTAL_TO_WIN}
            scoreIcon="🕯️"
        />
    )
}
