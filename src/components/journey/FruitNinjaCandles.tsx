'use client'

import React, { useRef, useState, useEffect } from 'react'
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'

import { useFruitNinjaStore, TOTAL_TO_WIN } from '@/hooks/use-fruitninja'
import { withBasePath } from '@/lib/base-path'

interface CandleObj {
    id: number
    spawnTime: number
    x: number
    y: number
    speedY: number
    wobbleOffset: number
    wobbleSpeed: number
    caught: boolean
    targetX: number
    targetY: number
    unlitUrl: string
    litUrl: string
    unlitTexture: THREE.Texture | null
    litTexture: THREE.Texture | null
    exiting?: boolean
    exitTime?: number
}

const MAX_CANDLES_ON_SCREEN = 15

export function FruitNinjaCandles({
    isActive,
    worldPosition = [0, 0, 0],
}: {
    isActive: boolean
    worldPosition?: [number, number, number]
}) {
    const { started, won, failed, score, setScore, setTimeLeft, setFailed, setWon, setIsActive, resetTrigger, resetGame } = useFruitNinjaStore()
    const [candles, setCandles] = useState<CandleObj[]>([])

    const textureLoader = useRef(new THREE.TextureLoader())
    const caughtIds = useRef<Set<number>>(new Set())

    const { camera, viewport } = useThree()

    const candlesWorldZ = worldPosition[2] + 5

    // Explicit 3D bounding calculation for spawns at the actual candle plane depth.
    const playArea = viewport.getCurrentViewport(camera, new THREE.Vector3(worldPosition[0], worldPosition[1], candlesWorldZ))
    const playAreaWidth = playArea.width
    const playAreaHeight = playArea.height

    // Track previous active state to detect leave/enter transitions
    const wasActiveRef = useRef(false)

    // Sync active state to store; reset the game whenever the player leaves
    useEffect(() => {
        setIsActive(isActive)

        if (!isActive && wasActiveRef.current) {
            // Player left the location — stop and clear everything
            resetGame()
            setCandles([])
            caughtIds.current.clear()
        }

        wasActiveRef.current = isActive
    }, [isActive, setIsActive, resetGame])

    // Timer
    useEffect(() => {
        if (!isActive || !started || won || failed) return
        const t = setInterval(() => {
            setTimeLeft((prev: number) => {
                if (prev <= 1) {
                    setFailed(true)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(t)
    }, [isActive, started, won, failed, setTimeLeft, setFailed])

    // Win condition check
    useEffect(() => {
        if (score >= TOTAL_TO_WIN && !won) {
            setWon(true)
        }
    }, [score, won, setWon])

    // Fly-away animation on game restart
    useEffect(() => {
        if (resetTrigger > 0) {
            setCandles(prev => prev.map(c => ({
                ...c,
                exiting: true,
                exitTime: Date.now(),
                targetY: playAreaHeight / 2 + 5, // Fly off top
                targetX: c.x + (Math.random() - 0.5) * 8 // Scatter horizontally
            })))
            caughtIds.current.clear()
        }
    }, [resetTrigger, playAreaHeight])

    // Spawning logic
    useEffect(() => {
        if (!isActive || !started || won || failed) return

        const spawner = setInterval(() => {
            setCandles(prev => {
                const now = Date.now()
                // Remove candles that flew off screen or finished exiting
                const active = prev.filter(c => {
                    if (c.exiting) {
                        return now - (c.exitTime || now) < 3000
                    }
                    if (c.caught) return true

                    const age = (now - c.spawnTime) / 1000
                    const currentY = c.y + c.speedY * age
                    return currentY < playAreaHeight / 2 + 1
                })
                const uncaughtCount = active.filter(c => !c.caught && !c.exiting).length

                if (uncaughtCount < MAX_CANDLES_ON_SCREEN) {
                    const candleId = Math.floor(Math.random() * 5) + 1 // 1 to 5
                    const unlitUrl = withBasePath(`/textures/journey/great-hall/candle-${candleId}.webp`)
                    const litUrl = withBasePath(`/textures/journey/great-hall/candle_flame-${candleId}.webp`)

                    const newCandle: CandleObj = {
                        id: Date.now() + Math.random(),
                        spawnTime: now,
                        x: (Math.random() - 0.5) * playAreaWidth * 0.8,
                        y: -playAreaHeight / 2 - 1, // Start just below screen
                        speedY: 2 + Math.random() * 2.5, // Faster to allow more candles to flow through
                        wobbleOffset: Math.random() * Math.PI * 2,
                        wobbleSpeed: 0.5 + Math.random() * 1.5,
                        caught: false,
                        targetX: (Math.random() - 0.5) * playAreaWidth * 0.8,
                        targetY: playAreaHeight / 2 - 0.5 - Math.random() * 1,
                        unlitUrl,
                        litUrl,
                        unlitTexture: null,
                        litTexture: null
                    }

                    // Fire and forget loads for both states
                    textureLoader.current.load(unlitUrl, (tex) => {
                        setCandles(curr => curr.map(c => c.id === newCandle.id ? { ...c, unlitTexture: tex } : c))
                    }, undefined, () => { })

                    textureLoader.current.load(litUrl, (tex) => {
                        setCandles(curr => curr.map(c => c.id === newCandle.id ? { ...c, litTexture: tex } : c))
                    }, undefined, () => { })

                    return [...active, newCandle]
                }
                return active
            })
        }, 800)
        return () => clearInterval(spawner)
    }, [isActive, started, won, failed, playAreaHeight, playAreaWidth])

    const catchCandle = (e: ThreeEvent<PointerEvent>, id: number) => {
        e.stopPropagation()
        if (won || failed) return

        const candleToCatch = candles.find(c => c.id === id)
        if (candleToCatch?.exiting) return

        if (!caughtIds.current.has(id)) {
            caughtIds.current.add(id)
            setScore((s: number) => s + 1)
            setCandles(prev => prev.map(c => c.id === id ? { ...c, caught: true } : c))
        }
    }

    // If completely inactive, render nothing
    if (!isActive) return null

    return (
        <group position={[worldPosition[0], worldPosition[1], candlesWorldZ]}>
            {/* Render Candles */}
            {candles.map((candle) => (
                <CandleMesh
                    key={candle.id}
                    candle={candle}
                    playAreaWidth={playAreaWidth}
                    onCatch={(e) => catchCandle(e, candle.id)}
                />
            ))}
        </group>
    )

}

function CandleMesh({ candle, onCatch, playAreaWidth }: { candle: CandleObj, onCatch: (e: ThreeEvent<PointerEvent>) => void, playAreaWidth: number }) {
    const meshRef = useRef<THREE.Mesh>(null)

    // Cache spawn time in a ref so it stays stable even if candle prop reference changes
    const spawnTimeRef = useRef(candle.spawnTime)
    const spawnYRef = useRef(candle.y)
    const spawnXRef = useRef(candle.x)

    useFrame((state, delta) => {
        if (!meshRef.current) return

        const safeDelta = Math.min(delta, 0.1)

        if (candle.exiting) {
            meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, candle.targetY, 5 * safeDelta)
            meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, candle.targetX, 5 * safeDelta)
            meshRef.current.rotation.z += safeDelta * 1.5
        } else if (!candle.caught) {
            // Deterministic position from wall-clock time: immune to frame-rate spikes
            const age = (Date.now() - spawnTimeRef.current) / 1000
            meshRef.current.position.y = spawnYRef.current + candle.speedY * age
            // Wobble X
            meshRef.current.position.x = spawnXRef.current + Math.sin(state.clock.elapsedTime * candle.wobbleSpeed + candle.wobbleOffset) * (playAreaWidth * 0.1)
        } else {
            // Caught: lerp to target
            meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, candle.targetY, 5 * safeDelta)
            meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, candle.targetX, 5 * safeDelta)
            meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 2 + candle.wobbleOffset) * 0.01
            meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, 0, 5 * safeDelta)
        }
    })

    const currentTex = candle.caught ? candle.litTexture : candle.unlitTexture

    // Dynamically calculate proportional size from texture (target height = 0.6)
    const img = (currentTex && currentTex.image) ? (currentTex.image as { width: number, height: number }) : null
    const aspect = (img && img.width && img.height) ? img.width / img.height : 0.33
    const targetHeight = 0.6
    const targetWidth = targetHeight * aspect

    // Start caught/exiting candles near their targets so they don't visually fly from the bottom if component remounts.
    // We store this in a ref so it only applies on initial mount, avoiding instant snaps when caught mid-air!
    const initialPos = useRef({
        x: candle.caught || candle.exiting ? candle.targetX : candle.x,
        y: candle.caught || candle.exiting ? candle.targetY : candle.y
    })

    return (
        <mesh
            ref={meshRef}
            position={[initialPos.current.x, initialPos.current.y, 0]}
            scale={[targetWidth, targetHeight, 1]}
            onPointerDown={onCatch}
            onPointerEnter={(e) => {
                // Support swipe catching (if pressing down while moving)
                if (e.buttons === 1) onCatch(e)
            }}
        >
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
                map={currentTex} // Unlit or lit depending on state
                color={currentTex ? "#ffffff" : "#444444"} // Dark placeholder before texture loads
                transparent
                depthWrite={false}
                side={THREE.DoubleSide}
            />
        </mesh>
    )
}
