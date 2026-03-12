import { useEffect, useRef, useState } from 'react'
import { useStore } from '@/lib/store'

/**
 * ✏️  Only change this number when adding/removing locations
 */
export const TOTAL_LOCATIONS = 11 // Great Hall, Staircases, Common Rooms, Room of Requirement, Forest, Library, Pensieve, CatCorner, Quidditch, HagridsHut, Hogsmeade

/**
 * Singleton scroll manager hook. 
 * Only one component should call useScrollManager() to handle events,
 * while others can call useLocationIndex() to passively read the smoothed value.
 */
export function useScrollManager() {
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
            if (!state.hasReadLetter || state.activeRoom !== 'hallway') return

            accumulatorRef.current += e.deltaY

            if (Math.abs(accumulatorRef.current) > 40) {
                const currentIndex = state.locationTargetIndex
                let nextIndex = currentIndex

                if (accumulatorRef.current > 0) {
                    nextIndex = Math.min(TOTAL_LOCATIONS - 1, currentIndex + 1)
                } else {
                    nextIndex = Math.max(0, currentIndex - 1)
                }

                if (nextIndex !== currentIndex) {
                    state.setLocationTargetIndex(nextIndex)
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

/**
 * Returns the current smothed location index (0, 1, 2 …) for camera/animations.
 */
export function useLocationIndex() {
    const [progress, setProgress] = useState(0)
    const currentRef = useRef(0)
    const rafRef = useRef<number | null>(null)

    useEffect(() => {
        const tick = () => {
            const target = useStore.getState().locationTargetIndex
            const diff = target - currentRef.current
            if (Math.abs(diff) > 0.0001) {
                currentRef.current += diff * 0.04
                setProgress(currentRef.current)
            } else {
                // Ensure exact match at the end to avoid tiny float errors in visibility checks
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

export function useScrollProgress() {
    return useLocationIndex()
}
