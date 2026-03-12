import { create } from 'zustand'

export const TOTAL_TO_WIN = 50
export const TIME_LIMIT = 120

interface FruitNinjaState {
    isActive: boolean
    started: boolean
    won: boolean
    failed: boolean
    score: number
    timeLeft: number
    resetTrigger: number

    setIsActive: (active: boolean) => void
    setStarted: (started: boolean) => void
    setWon: (won: boolean) => void
    setFailed: (failed: boolean) => void
    setScore: (score: number | ((prev: number) => number)) => void
    setTimeLeft: (time: number | ((prev: number) => number)) => void

    startGame: () => void
    resetGame: () => void
}

export const useFruitNinjaStore = create<FruitNinjaState>((set) => ({
    isActive: false,
    started: false,
    won: false,
    failed: false,
    score: 0,
    timeLeft: TIME_LIMIT,
    resetTrigger: 0,

    setIsActive: (active) => set({ isActive: active }),
    setStarted: (started) => set({ started }),
    setWon: (won) => set({ won }),
    setFailed: (failed) => set({ failed }),
    setScore: (updater) => set((state) => ({
        score: typeof updater === 'function' ? updater(state.score) : updater
    })),
    setTimeLeft: (updater) => set((state) => ({
        timeLeft: typeof updater === 'function' ? updater(state.timeLeft) : updater
    })),

    startGame: () => set((state) => ({
        started: true,
        won: false,
        failed: false,
        score: 0,
        timeLeft: TIME_LIMIT,
        resetTrigger: state.resetTrigger + 1
    })),
    resetGame: () => set({
        started: false,
        won: false,
        failed: false,
        score: 0,
        timeLeft: TIME_LIMIT
    })
}))
