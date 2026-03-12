import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { TOTAL_PUZZLES } from '@/config/journey'
import { JOURNEY_SEQUENCE, type JourneyLocationKey } from '@/config/journey-sequence'

function computeMaxUnlockedIndex(completed: Partial<Record<JourneyLocationKey, boolean>>): number {
    // `maxUnlockedIndex` means "furthest location you can reach".
    // You can always reach the next location, but you can't go past a gated one until it's completed.
    let max = 0
    for (let i = 0; i < TOTAL_PUZZLES - 1; i++) {
        const meta = JOURNEY_SEQUENCE[i]
        const cleared = !meta?.gated || !!completed[meta.key]
        if (!cleared) break
        max = i + 1
    }
    return Math.max(0, Math.min(max, TOTAL_PUZZLES - 1))
}

type RoomType = 'hallway' | 'gryffindor' | 'slytherin' | 'ravenclaw' | 'hufflepuff' | 'requirement'

interface GameState {
    hasReadLetter: boolean
    readLetter: () => void

    activeRoom: RoomType
    setActiveRoom: (room: RoomType) => void

    isJsSpellsOpen: boolean
    setJsSpellsOpen: (open: boolean) => void
    isTerminalOpen: boolean
    setTerminalOpen: (open: boolean) => void
    isLumosActive: boolean
    setLumosActive: (active: boolean) => void

    // Memory Viewer State (Pensieve)
    activeMemoryUrl: string | null
    setActiveMemoryUrl: (url: string | null) => void

    // Scroll Location System
    locationTargetIndex: number
    setLocationTargetIndex: (index: number) => void

    // Track which secrets are unlocked globally so we can persist them later
    unlockedRooms: Record<RoomType, boolean>
    unlockRoom: (room: RoomType) => void

    // --- Puzzle Journey State ---
    puzzleLocationIndex: number
    setPuzzleLocationIndex: (idx: number) => void
    maxUnlockedIndex: number
    setMaxUnlockedIndex: (idx: number) => void
    unlockNextPuzzle: () => void
    completedJourney: Partial<Record<JourneyLocationKey, boolean>>
    markJourneyCompleted: (key: JourneyLocationKey) => void
}

export const useStore = create<GameState>()(persist((set, get) => ({
    hasReadLetter: false,
    readLetter: () => set({ hasReadLetter: true }),

    activeRoom: 'hallway',
    setActiveRoom: (room) => set({ activeRoom: room }),

    isJsSpellsOpen: false,
    setJsSpellsOpen: (open) => set((state) => ({
        isJsSpellsOpen: open,
        isTerminalOpen: open ? false : state.isTerminalOpen
    })),

    isTerminalOpen: false,
    setTerminalOpen: (open) => set((state) => ({
        isTerminalOpen: open,
        isJsSpellsOpen: open ? false : state.isJsSpellsOpen
    })),
    isLumosActive: false,
    setLumosActive: (active) => set({ isLumosActive: active }),

    activeMemoryUrl: null,
    setActiveMemoryUrl: (url) => set({ activeMemoryUrl: url }),

    locationTargetIndex: 0,
    setLocationTargetIndex: (index) => set({ locationTargetIndex: index }),

    unlockedRooms: {
        hallway: true, // always unlocked
        gryffindor: false,
        slytherin: false,
        ravenclaw: false,
        hufflepuff: false,
        requirement: false
    },
    unlockRoom: (room) => set((state) => ({
        unlockedRooms: { ...state.unlockedRooms, [room]: true }
    })),

    // --- Puzzle Journey State ---
    puzzleLocationIndex: 0,
    setPuzzleLocationIndex: (idx) => set((state) => ({
        puzzleLocationIndex: Math.max(0, Math.min(idx, state.maxUnlockedIndex))
    })),
    maxUnlockedIndex: 0,
    setMaxUnlockedIndex: (idx) => set((state) => {
        const next = Math.max(0, Math.min(idx, TOTAL_PUZZLES - 1))
        return {
            maxUnlockedIndex: next,
            puzzleLocationIndex: Math.min(state.puzzleLocationIndex, next),
        }
    }),
    unlockNextPuzzle: () => set((state) => ({
        maxUnlockedIndex: Math.max(state.maxUnlockedIndex, computeMaxUnlockedIndex(state.completedJourney)),
    })),
    completedJourney: {},
    markJourneyCompleted: (key) => set((state) => {
        const completedJourney = { ...state.completedJourney, [key]: true }
        const maxUnlockedIndex = Math.max(state.maxUnlockedIndex, computeMaxUnlockedIndex(completedJourney))
        return {
            completedJourney,
            maxUnlockedIndex,
            puzzleLocationIndex: Math.min(state.puzzleLocationIndex, maxUnlockedIndex),
        }
    }),
}), {
    name: 'hogwarts_progress_v1',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
        hasReadLetter: state.hasReadLetter,
        activeRoom: state.activeRoom,
        unlockedRooms: state.unlockedRooms,
        puzzleLocationIndex: state.puzzleLocationIndex,
        maxUnlockedIndex: state.maxUnlockedIndex,
        completedJourney: state.completedJourney,
    }),
    onRehydrateStorage: () => (state) => {
        if (!state) return
        // Recompute max unlocked based on which gated locations were actually completed.
        const recomputed = computeMaxUnlockedIndex(state.completedJourney ?? {})
        state.setMaxUnlockedIndex(recomputed)
    }
}))
