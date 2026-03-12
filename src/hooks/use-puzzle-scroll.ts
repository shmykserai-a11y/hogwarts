import { useEffect, useRef, useState } from 'react'
import { useStore } from '@/lib/store'
import { TOTAL_PUZZLES } from '@/config/journey'

export { TOTAL_PUZZLES } // Re-export for consumers that already import from here

export function usePuzzleScrollManager() {
    const accumulatorRef = useRef(0)
    const lastWheelTimeRef = useRef(0)
    const cooldownRef = useRef(false)
    const cooldownTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        const handleWheel = (e: WheelEvent) => {
            const now = Date.now()
            if (now - lastWheelTimeRef.current > 150) {
                accumulatorRef.current = 0
            }
            lastWheelTimeRef.current = now
            if (cooldownRef.current) return

            const state = useStore.getState()

            accumulatorRef.current += e.deltaY

            if (Math.abs(accumulatorRef.current) > 40) {
                const currentIndex = state.puzzleLocationIndex
                let nextIndex = currentIndex

                if (accumulatorRef.current > 0) {
                    // Wheel down (positive deltaY): go forward, but limit to maxUnlockedIndex
                    nextIndex = Math.min(TOTAL_PUZZLES - 1, currentIndex + 1)
                    if (nextIndex > state.maxUnlockedIndex) {
                        // Shake effect or sound could be triggered here to hint it's locked
                        console.log("Locked! Solve the puzzle first.")
                        nextIndex = currentIndex // revert
                    }
                } else {
                    // Wheel up: going back is always allowed
                    nextIndex = Math.max(0, currentIndex - 1)
                }

                if (nextIndex !== currentIndex) {
                    state.setPuzzleLocationIndex(nextIndex)
                }

                accumulatorRef.current = 0
                cooldownRef.current = true

                if (cooldownTimeoutRef.current) clearTimeout(cooldownTimeoutRef.current)
                cooldownTimeoutRef.current = setTimeout(() => {
                    cooldownRef.current = false
                    accumulatorRef.current = 0
                }, 800)
            }
        }

        window.addEventListener('wheel', handleWheel, { passive: true })
        return () => {
            window.removeEventListener('wheel', handleWheel)
            if (cooldownTimeoutRef.current) clearTimeout(cooldownTimeoutRef.current)
        }
    }, [])
}

export function usePuzzleLocationIndex() {
    const initial = useStore.getState().puzzleLocationIndex
    const [progress, setProgress] = useState(initial)
    const currentRef = useRef(initial)
    const rafRef = useRef<number | null>(null)

    useEffect(() => {
        const tick = () => {
            const target = useStore.getState().puzzleLocationIndex
            const diff = target - currentRef.current
            if (Math.abs(diff) > 0.0001) {
                currentRef.current += diff * 0.04
                setProgress(currentRef.current)
            } else {
                if (currentRef.current !== target) {
                    currentRef.current = target
                    setProgress(target)
                }
            }
            rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
    }, [])

    return progress
}
