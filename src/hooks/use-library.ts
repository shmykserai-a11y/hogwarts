import { create } from 'zustand'

export const TIME_LIMIT = 180

interface LibraryState {
    isActive: boolean
    started: boolean
    won: boolean
    failed: boolean
    timeLeft: number

    setIsActive: (active: boolean) => void
    setStarted: (started: boolean) => void
    setWon: (won: boolean) => void
    setFailed: (failed: boolean) => void
    setTimeLeft: (time: number | ((prev: number) => number)) => void

    startGame: () => void
    resetGame: () => void
}

export const useLibraryStore = create<LibraryState>((set) => ({
    isActive: false,
    started: false,
    won: false,
    failed: false,
    timeLeft: TIME_LIMIT,

    setIsActive: (active) => set({ isActive: active }),
    setStarted: (started) => set({ started }),
    setWon: (won) => set({ won }),
    setFailed: (failed) => set({ failed }),
    setTimeLeft: (updater) => set((state) => ({
        timeLeft: typeof updater === 'function' ? updater(state.timeLeft) : updater
    })),

    startGame: () => set({
        started: true,
        won: false,
        failed: false,
        timeLeft: TIME_LIMIT
    }),
    resetGame: () => set({
        started: false,
        won: false,
        failed: false,
        timeLeft: TIME_LIMIT
    })
}))
