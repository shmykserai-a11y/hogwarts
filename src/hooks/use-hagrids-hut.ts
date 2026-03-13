import { create } from 'zustand'

export const TIME_LIMIT = 60

export interface HutItem {
    id: string
    label: string
    emoji: string
    // HitZone normalized coords (center x/y, width/height relative to image plane)
    hitX: number
    hitY: number
    hitW: number
    hitH: number
}

export const HUT_ITEMS: HutItem[] = [
    // ✅ all calibrated via debugger
    { id: 'fang', label: 'Fang the Dog', emoji: '🐕', hitX: -0.27, hitY: -0.30, hitW: 0.15, hitH: 0.22 },
    { id: 'firewood', label: 'Firewood', emoji: '🪵', hitX: -0.41, hitY: -0.38, hitW: 0.12, hitH: 0.21 },
    { id: 'fishing_net', label: 'Fishing Net', emoji: '🪤', hitX: -0.02, hitY: 0.36, hitW: 0.11, hitH: 0.18 },
    { id: 'crossbow', label: 'Arrows', emoji: '🏹', hitX: 0.44, hitY: 0.00, hitW: 0.05, hitH: 0.36 },
    { id: 'big_basket', label: 'Big Basket', emoji: '🧺', hitX: 0.20, hitY: 0.43, hitW: 0.07, hitH: 0.13 },
    { id: 'dragon_egg', label: 'Dragon Egg', emoji: '🥚', hitX: 0.26, hitY: 0.14, hitW: 0.07, hitH: 0.13 },
    { id: 'teapot', label: 'Teapot', emoji: '🫖', hitX: 0.13, hitY: -0.13, hitW: 0.09, hitH: 0.11 },
    { id: 'cauldron', label: 'Cauldron', emoji: '🪣', hitX: -0.21, hitY: -0.06, hitW: 0.08, hitH: 0.12 },
    { id: 'window', label: 'Window', emoji: '🪟', hitX: -0.46, hitY: 0.09, hitW: 0.06, hitH: 0.23 },
    { id: 'sleeve_patch', label: 'Sleeve Patch', emoji: '🧵', hitX: 0.33, hitY: -0.03, hitW: 0.04, hitH: 0.09 },
]



function shuffle<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

export type HutPhase = 'idle' | 'playing' | 'won' | 'failed'

interface HagridsHutState {
    isActive: boolean
    phase: HutPhase
    timeLeft: number
    order: HutItem[]      // shuffled list for this session
    currentIndex: number  // which item to find now
    foundIds: string[]    // items found so far
    wrongFlash: boolean   // triggers a red shake on wrong click

    setIsActive: (active: boolean) => void
    startGame: () => void
    handleClick: (itemId: string) => void
    resetGame: () => void
    tick: () => void
    setWrongFlash: (v: boolean) => void
}

export const useHagridsHutStore = create<HagridsHutState>((set, get) => ({
    isActive: false,
    phase: 'idle',
    timeLeft: TIME_LIMIT,
    order: shuffle(HUT_ITEMS),
    currentIndex: 0,
    foundIds: [],
    wrongFlash: false,

    setIsActive: (active) => {
        const wasActive = get().isActive
        if (!active && wasActive) {
            // Left location — full reset
            set({ isActive: false, phase: 'idle', timeLeft: TIME_LIMIT, currentIndex: 0, foundIds: [], order: shuffle(HUT_ITEMS) })
        } else {
            set({ isActive: active })
        }
    },

    startGame: () => set({
        phase: 'playing',
        timeLeft: TIME_LIMIT,
        currentIndex: 0,
        foundIds: [],
        order: shuffle(HUT_ITEMS),
        wrongFlash: false,
    }),

    handleClick: (itemId) => {
        const { phase, order, currentIndex, foundIds } = get()
        if (phase !== 'playing') return

        const target = order[currentIndex]
        if (itemId === target.id) {
            const newFound = [...foundIds, itemId]
            const nextIndex = currentIndex + 1
            if (nextIndex >= order.length) {
                set({ foundIds: newFound, phase: 'won' })
            } else {
                set({ foundIds: newFound, currentIndex: nextIndex })
            }
        } else {
            // Wrong zone — flash and don't advance
            set({ wrongFlash: true })
            setTimeout(() => get().setWrongFlash(false), 500)
        }
    },

    resetGame: () => set({
        phase: 'idle',
        timeLeft: TIME_LIMIT,
        currentIndex: 0,
        foundIds: [],
        order: shuffle(HUT_ITEMS),
        wrongFlash: false,
    }),

    tick: () => {
        const { phase, timeLeft } = get()
        if (phase !== 'playing') return
        if (timeLeft <= 1) {
            set({ phase: 'failed', timeLeft: 0 })
        } else {
            set({ timeLeft: timeLeft - 1 })
        }
    },

    setWrongFlash: (v) => set({ wrongFlash: v }),
}))
