'use client'

import React, { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useControls } from 'leva'
import { useLibraryStore, TIME_LIMIT } from '@/hooks/use-library'
import { usePuzzleLocationIndex } from '@/hooks/use-puzzle-scroll'
import { useStore } from '@/lib/store'
import { JourneyLayer, preloadJourneyLocation } from './JourneyLocationBase'

// ─── Assets ───────────────────────────────────────────────────────────────────
const BG_URL = '/textures/journey/library/bg.webp'
const DESK_URL = '/textures/journey/library/desk.webp'

interface BookDef {
    id: number
    url: string
    hitX: number
    hitY: number
    hitW: number
    hitH: number
}

const BOOKS: BookDef[] = [
    { id: 0, url: '/textures/journey/library/book_left.webp', hitX: -0.091, hitY: -0.118, hitW: 0.171, hitH: 0.346 },
    { id: 1, url: '/textures/journey/library/book_middle.webp', hitX: 0.136, hitY: -0.155, hitW: 0.107, hitH: 0.256 },
    { id: 2, url: '/textures/journey/library/book_small.webp', hitX: 0.039, hitY: -0.170, hitW: 0.085, hitH: 0.199 },
    { id: 3, url: '/textures/journey/library/book_right.webp', hitX: 0.272, hitY: -0.205, hitW: 0.160, hitH: 0.273 },
]

// ── Z Positions ───────────────────────────────────────────────────────────────
// All foreground elements share the exact same plane (FG_Z).
// Each book gets a micro-offset (+id*0.01) to avoid z-fighting only—this does
// NOT affect their visual size or apparent depth at the camera.
const BG_Z = -15
const FG_Z = 0

// ── Brightness ────────────────────────────────────────────────────────────────
// Slightly dark foreground to match the moody library aesthetic
const FG_BRIGHTNESS = 0.8   // 1.0 = full original, 0.8 = 20% darker

// ── Difficulty Curve ──────────────────────────────────────────────────────────
// Based on elapsed game time (0 → TIME_LIMIT = 180s); each phase is 36s:
//   Phase 1   0–36s:  1 book, 5s spawn
//   Phase 2  36–72s:  2 books, 3s spawn
//   Phase 3  72–108s: 3 books, 2s spawn
//   Phase 4 108–144s: 4 books, 1s spawn
//   Phase 5 144–180s: 4 books, 0.5s spawn
function getDifficulty(timeLeft: number): { maxActive: number; spawnInterval: number; angerSpeed: number } {
    const elapsed = TIME_LIMIT - timeLeft
    if (elapsed < 36) return { maxActive: 1, spawnInterval: 5000, angerSpeed: 0.10 } // 10s to fill
    if (elapsed < 72) return { maxActive: 2, spawnInterval: 3000, angerSpeed: 0.12 } // 8.3s to fill
    if (elapsed < 108) return { maxActive: 3, spawnInterval: 2000, angerSpeed: 0.14 } // 7.1s to fill
    if (elapsed < 144) return { maxActive: 4, spawnInterval: 1000, angerSpeed: 0.17 } // 5.8s to fill
    return { maxActive: 4, spawnInterval: 500, angerSpeed: 0.20 } // 5s to fill
}

const CALM_SPEED = 1.17  // +30% vs original 0.9
// Max shake amplitude (halved from previous version)
const MAX_SHAKE = 0.15
// How many seconds of anger before shaking starts
const SHAKE_DELAY_ANGER = 0.25  // shake only after anger crosses 25%

import { HitZone } from '../HitZone'

// ─── Interactive Book Sub-Component ──────────────────────────────────────────

function InteractiveBook({
    book, opacity, focusedCameraZ, groupZ,
    matRef, meshRef, onHoldStart, onHoldEnd,
}: {
    book: BookDef
    opacity: number
    focusedCameraZ: number
    groupZ: number
    matRef: (m: THREE.MeshBasicMaterial | null) => void
    meshRef: (m: THREE.Mesh | null) => void
    onHoldStart: () => void
    onHoldEnd: () => void
}) {
    return (
        <group>
            {/* Visual layer – same Z as desk, micro-offset to avoid z-fighting */}
            <JourneyLayer
                textureUrl={book.url}
                localZ={FG_Z + book.id * 0.001}
                opacity={opacity}
                focusedCameraZ={focusedCameraZ}
                groupZ={groupZ}
                sizeMultiplier={1.0}
                meshRef={meshRef}
                materialRef={matRef}
                fog={false}
            >
                {/* Per-book invisible hit zone - inherits JourneyLayer normalizations */}
                <HitZone
                    id={`library_book_${book.id}`}
                    initialX={book.hitX}
                    initialY={book.hitY}
                    initialW={book.hitW}
                    initialH={book.hitH}
                    onPointerDown={(e) => { e.stopPropagation(); onHoldStart() }}
                    onPointerUp={(e) => { e.stopPropagation(); onHoldEnd() }}
                    onPointerOut={(e) => { e.stopPropagation(); onHoldEnd() }}
                />
            </JourneyLayer>
        </group>
    )
}

// ─── Main Section ─────────────────────────────────────────────────────────────

export function LibrarySection({ position = [0, 0, 0], index }: { position?: [number, number, number]; index: number }) {
    const locationIndex = usePuzzleLocationIndex()
    const { unlockNextPuzzle, maxUnlockedIndex, markJourneyCompleted } = useStore()
    const { setIsActive, started, won, failed, timeLeft, setWon, setFailed, setTimeLeft, resetGame } = useLibraryStore()

    const dist = Math.abs(locationIndex - index)
    const isVisible = dist < 0.9
    // HUD activates only when squarely on this location (matches Snape Cauldron behaviour)
    const isOnLocation = Math.round(locationIndex) === index
    const opacity = dist < 0.6 ? 1 - dist / 0.6 : 0

    const groupRef = useRef<THREE.Group>(null)
    const focusedCameraZ = 68 - index * 30
    const groupZ = position[2]

    // ── Game State ─────────────────────────────────────────────────────────
    const [angers, setAngers] = useState<Record<number, number>>({ 0: 0, 1: 0, 2: 0, 3: 0 })
    const [activeIds, setActiveIds] = useState<number[]>([])
    const holdsRef = useRef<Record<number, boolean>>({})
    const bookMatRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([])
    const bookMeshRefs = useRef<(THREE.Mesh | null)[]>([])
    // Track elapsed shaking time per book to implement the 2-second delay
    const bookAngerStartRef = useRef<Record<number, number>>({})

    // ── Activation & Re-entry Reset ─────────────────────────────────────────
    // Track whether we *were* active last frame so we can detect re-entry.
    const wasActiveRef = useRef(false)

    useEffect(() => {
        const isNowActive = isOnLocation
        setIsActive(isNowActive)

        // If we just entered the location (was inactive, now active) AND the game
        // is in a non-idle state, reset it so the Start button appears fresh.
        if (isNowActive && !wasActiveRef.current && (started || won || failed)) {
            resetGame()
        }
        wasActiveRef.current = isNowActive
    }, [isOnLocation, setIsActive, started, won, failed, resetGame])

    // ── Countdown Timer ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!isVisible || !started || won || failed) return
        const t = setInterval(() => {
            setTimeLeft((prev: number) => {
                if (prev <= 1) {
                    setWon(true)
                    markJourneyCompleted('library')
                    if (maxUnlockedIndex === index) unlockNextPuzzle()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(t)
    }, [isVisible, started, won, failed, setTimeLeft, setWon, unlockNextPuzzle, maxUnlockedIndex, index])

    // ── Difficulty-Scaled Spawn Timer ───────────────────────────────────────
    // Re-evaluated every time timeLeft crosses a phase boundary.
    const { maxActive, spawnInterval } = getDifficulty(timeLeft)

    useEffect(() => {
        if (!isVisible || !started || won || failed) return

        const tick = setInterval(() => {
            setActiveIds(prev => {
                if (prev.length >= maxActive) return prev
                if (Math.random() < 0.65) {   // 65% chance to spawn on tick
                    const inactive = BOOKS.filter(b => !prev.includes(b.id))
                    if (inactive.length === 0) return prev
                    const next = inactive[Math.floor(Math.random() * inactive.length)]
                    // Record when this book became active so we can delay shaking
                    bookAngerStartRef.current[next.id] = Date.now()
                    return [...prev, next.id]
                }
                return prev
            })
        }, spawnInterval)

        return () => clearInterval(tick)
    }, [isVisible, started, won, failed, maxActive, spawnInterval])

    // ── Game Loop ───────────────────────────────────────────────────────────
    useFrame((state, delta) => {
        if (!groupRef.current || !started || won || failed) return

        const { angerSpeed } = getDifficulty(timeLeft)

        setAngers(prev => {
            const next = { ...prev }
            let anyEscaped = false

            // Advance or calm active books
            activeIds.forEach(id => {
                if (holdsRef.current[id]) {
                    next[id] = Math.max(0, next[id] - delta * CALM_SPEED)
                } else {
                    next[id] = Math.min(1, next[id] + delta * angerSpeed)
                    if (next[id] >= 1) anyEscaped = true
                }
            })

            if (anyEscaped) setFailed(true)

            // Deactivate fully calmed books
            const calmed = activeIds.filter(id => next[id] <= 0)
            if (calmed.length > 0) {
                setActiveIds(ids => ids.filter(id => !calmed.includes(id)))
                calmed.forEach(id => { delete bookAngerStartRef.current[id] })
            }

            return next
        })

        // ── Visuals ───────────────────────────────────────────────────────
        const now = state.clock.getElapsedTime()
        BOOKS.forEach(book => {
            const mat = bookMatRefs.current[book.id]
            const mesh = bookMeshRefs.current[book.id]
            if (!mat || !mesh) return

            const anger = angers[book.id] ?? 0
            const isActive = activeIds.includes(book.id)

            if (isActive) {
                // Color tint: lerp from white → red
                const r = 1
                const g = FG_BRIGHTNESS * (1 - anger * 0.8)
                const b = FG_BRIGHTNESS * (1 - anger * 0.8)
                mat.color.lerp(new THREE.Color(r, g, b), 0.12)

                // Shaking: only after anger exceeds threshold (~2s worth at default speed)
                if (anger > SHAKE_DELAY_ANGER) {
                    const shakeT = (anger - SHAKE_DELAY_ANGER) / (1 - SHAKE_DELAY_ANGER)
                    const intensity = shakeT * shakeT * MAX_SHAKE
                    const freq = 20 + shakeT * 30
                    mesh.position.x = Math.sin(now * freq) * intensity
                    mesh.position.y = Math.cos(now * freq * 1.13) * intensity
                } else {
                    mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, 0, 0.15)
                    mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, 0, 0.15)
                }
            } else {
                // Return to neutral — slightly dimmed white
                mat.color.lerp(new THREE.Color(FG_BRIGHTNESS, FG_BRIGHTNESS, FG_BRIGHTNESS), 0.1)
                mesh.position.x = THREE.MathUtils.lerp(mesh.position.x, 0, 0.2)
                mesh.position.y = THREE.MathUtils.lerp(mesh.position.y, 0, 0.2)
            }
        })

        // Also dim the desk material to match
        // (desk matRef is separate — handled via JourneyLayer's own ref)
    })

    // ── Reset ───────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!started) {
            setAngers({ 0: 0, 1: 0, 2: 0, 3: 0 })
            setActiveIds([])
            holdsRef.current = {}
            bookAngerStartRef.current = {}
            bookMatRefs.current.forEach(m => {
                if (m) m.color.set(FG_BRIGHTNESS, FG_BRIGHTNESS, FG_BRIGHTNESS)
            })
            bookMeshRefs.current.forEach(m => m?.position.set(0, 0, m.position.z))
        }
    }, [started])

    if (!isVisible) return null

    return (
        <group ref={groupRef} position={position}>
            {/* Background */}
            <JourneyLayer
                textureUrl={BG_URL}
                localZ={BG_Z}
                opacity={opacity}
                focusedCameraZ={focusedCameraZ}
                groupZ={groupZ}
                sizeMultiplier={1.0}
                fog={false}
            />

            {/* Desk — same FG_Z plane as books */}
            <JourneyLayer
                textureUrl={DESK_URL}
                localZ={FG_Z}
                opacity={opacity}
                focusedCameraZ={focusedCameraZ}
                groupZ={groupZ}
                sizeMultiplier={1.0}
                fog={false}
            />

            {/* Books — same plane as desk, micro-offset per book */}
            {BOOKS.map(book => (
                <InteractiveBook
                    key={book.id}
                    book={book}
                    opacity={opacity}
                    focusedCameraZ={focusedCameraZ}
                    groupZ={groupZ}
                    onHoldStart={() => { holdsRef.current[book.id] = true }}
                    onHoldEnd={() => { holdsRef.current[book.id] = false }}
                    matRef={(m) => { bookMatRefs.current[book.id] = m }}
                    meshRef={(m) => { bookMeshRefs.current[book.id] = m }}
                />
            ))}
        </group>
    )
}

preloadJourneyLocation(BG_URL, DESK_URL)
