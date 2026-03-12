'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useControls, folder } from 'leva'
import { JourneyLocationBase, preloadJourneyLocation } from './JourneyLocationBase'
import { usePuzzleLocationIndex } from '@/hooks/use-puzzle-scroll'
import { HitZone } from '../HitZone'
import { useStore } from '@/lib/store'

interface InvitationLetterProps {
    position?: [number, number, number]
    index?: number
}

const ENVELOPE_URL = '/textures/journey/invitation-letter/envelope.webp'
const LETTER_URL = '/textures/journey/invitation-letter/letter.webp'
const HAND_FONT_URL = '/fonts/DancingScript.ttf'

const DEFAULT_SEAL_ZONE = {
    // Defaults based on the zone you tuned in the HitZone debugger screenshot.
    x: 0.05,
    y: -0.04,
    w: 0.2,
    h: 0.37,
} as const

const OPEN_DURATION_MS = 1100
const BURST_DURATION_S = 0.7
const BURST_COUNT = 72
const BURST_COLOR = '#ffe38a'
const BURST_SIZE_PX = 12

const LETTER_TEXT = [
    'Tanya, happy birthday!',
    '',
    "We're waiting for you to visit. We'll show you our sights and magical creatures: the Great Hall with its enchanted ceiling, the Forbidden Forest (just be careful, not all creatures there are friendly!) and much more.",
    '',
    "We'll give you a tour of the library and teach you how to fly a broom (promise not to drop you). We promise it'll be interesting.",
    '',
    "We're waiting for you at Hogwarts!",
    'Your friends from Hogwarts',
].join('\n')

function SealParticleBurst({
    triggerKey,
    zoneW,
    zoneH,
    color,
}: {
    triggerKey: number
    zoneW: number
    zoneH: number
    color: string
}) {
    const pointsRef = useRef<THREE.Points>(null)
    const matRef = useRef<THREE.PointsMaterial>(null)

    const spriteTexture = useMemo(() => {
        // Small circular gradient sprite to avoid square-looking points.
        const size = 64
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) return null

        const cx = size / 2
        const cy = size / 2
        const r = size * 0.48
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
        g.addColorStop(0, 'rgba(255,255,255,1)')
        g.addColorStop(0.35, 'rgba(255,255,255,0.9)')
        g.addColorStop(0.75, 'rgba(255,255,255,0.25)')
        g.addColorStop(1, 'rgba(255,255,255,0)')

        ctx.clearRect(0, 0, size, size)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.fill()

        const tex = new THREE.CanvasTexture(canvas)
        tex.colorSpace = THREE.SRGBColorSpace
        tex.needsUpdate = true
        return tex
    }, [])

    const geo = useMemo(() => {
        const geometry = new THREE.BufferGeometry()
        const positions = new Float32Array(BURST_COUNT * 3)
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        return geometry
    }, [])

    const velocitiesRef = useRef<Float32Array | null>(null)
    const startRef = useRef<number>(0)
    const activeRef = useRef(false)
    const baseSizeRef = useRef(BURST_SIZE_PX)

    const reseed = () => {
        const positions = (geo.getAttribute('position') as THREE.BufferAttribute).array as Float32Array
        const velocities = new Float32Array(BURST_COUNT * 3)

        for (let i = 0; i < BURST_COUNT; i++) {
            const idx = i * 3
            const angle = Math.random() * Math.PI * 2
            const jitter = (Math.random() - 0.5) * 0.15

            // Start near the seal center.
            const startR = (0.04 + Math.random() * 0.08) * Math.min(zoneW, zoneH)
            const x0 = Math.cos(angle) * startR * (zoneW / Math.min(zoneW, zoneH))
            const y0 = Math.sin(angle) * startR * (zoneH / Math.min(zoneW, zoneH))

            positions[idx + 0] = x0
            positions[idx + 1] = y0
            positions[idx + 2] = (Math.random() - 0.5) * 0.01

            // Radial "shockwave" burst: outward in all directions around the seal.
            const baseSpeed = 0.55 + Math.random() * 0.65
            const sx = (zoneW * 1.6) / Math.min(zoneW, zoneH)
            const sy = (zoneH * 1.6) / Math.min(zoneW, zoneH)

            const vxR = Math.cos(angle) * baseSpeed * sx
            const vyR = Math.sin(angle) * baseSpeed * sy

            // Tiny tangential component so it feels magical, not purely ballistic.
            const swirl = (Math.random() - 0.5) * 0.55
            const vxT = -Math.sin(angle) * swirl
            const vyT = Math.cos(angle) * swirl

            velocities[idx + 0] = vxR + vxT + jitter
            velocities[idx + 1] = vyR + vyT - jitter
            velocities[idx + 2] = (Math.random() - 0.5) * 0.03
        }

        velocitiesRef.current = velocities
        ;(geo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true

        startRef.current = performance.now()
        activeRef.current = true

        if (pointsRef.current) pointsRef.current.visible = true
        if (matRef.current) {
            matRef.current.color.set(color)
            matRef.current.opacity = 1
            matRef.current.size = baseSizeRef.current
        }
    }

    useEffect(() => {
        if (triggerKey <= 0) return
        reseed()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [triggerKey])

    useEffect(() => {
        if (!matRef.current) return
        matRef.current.color.set(color)
    }, [color])

    useFrame((_, delta) => {
        if (!activeRef.current) return
        const now = performance.now()
        const ageS = (now - startRef.current) / 1000
        const t = Math.min(ageS / BURST_DURATION_S, 1)

        const mat = matRef.current
        const points = pointsRef.current
        if (!mat || !points) return

        // Smooth fade-out and slight "bloom shrink" at the end.
        const fade = 1 - THREE.MathUtils.smoothstep(t, 0.0, 1)
        mat.opacity = fade
        mat.size = THREE.MathUtils.lerp(baseSizeRef.current * 1.1, baseSizeRef.current * 0.75, t)

        const velocities = velocitiesRef.current
        const positions = (geo.getAttribute('position') as THREE.BufferAttribute).array as Float32Array
        if (!velocities) return

        const damping = Math.pow(0.25, delta) // frame-rate independent-ish
        for (let i = 0; i < BURST_COUNT; i++) {
            const idx = i * 3
            positions[idx + 0] += velocities[idx + 0] * delta
            positions[idx + 1] += velocities[idx + 1] * delta
            positions[idx + 2] += velocities[idx + 2] * delta

            velocities[idx + 0] *= damping
            velocities[idx + 1] *= damping
            velocities[idx + 2] *= damping
        }
        ;(geo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true

        if (t >= 1) {
            activeRef.current = false
            points.visible = false
        }
    })

    return (
        <points ref={pointsRef} geometry={geo} visible={false}>
            <pointsMaterial
                ref={matRef}
                color={BURST_COLOR}
                size={BURST_SIZE_PX}
                sizeAttenuation={false}
                transparent
                opacity={0}
                map={spriteTexture ?? undefined}
                alphaTest={0.05}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                toneMapped={false}
            />
        </points>
    )
}

export function InvitationLetter({ position = [0, 0, 0], index = 0 }: InvitationLetterProps) {
    const locationIndex = usePuzzleLocationIndex()
    const isOnLocation = Math.round(locationIndex) === index
    const { maxUnlockedIndex, unlockNextPuzzle, completedJourney, markJourneyCompleted } = useStore()
    const isCompleted = !!completedJourney.invitation || maxUnlockedIndex > index

    const [clicks, setClicks] = useState(0)
    const [revealProgress, setRevealProgress] = useState(0)
    const [sparkBurstKey, setSparkBurstKey] = useState(0)

    const rafRef = useRef<number | null>(null)
    const revealStartRef = useRef<number | null>(null)

    const {
        locationScale,
        sealX,
        sealY,
        sealW,
        sealH,
        x: textX,
        y: textY,
        w: textW,
        fontSize,
        lineHeight,
        rotationDeg,
        debugBox,
    } = useControls(
        '0. Invitation Letter',
        {
            Envelope: folder({
                locationScale: { value: 0.8, min: 0.25, max: 1.0, step: 0.01 },
            }),
            Seal: folder({
                sealX: { value: DEFAULT_SEAL_ZONE.x, min: -0.48, max: 0.48, step: 0.001 },
                sealY: { value: DEFAULT_SEAL_ZONE.y, min: -0.48, max: 0.48, step: 0.001 },
                sealW: { value: DEFAULT_SEAL_ZONE.w, min: 0.02, max: 0.8, step: 0.001 },
                sealH: { value: DEFAULT_SEAL_ZONE.h, min: 0.02, max: 0.8, step: 0.001 },
            }),
            Text: folder({
                x: { value: -0.16, min: -0.48, max: 0.48, step: 0.001 },
                y: { value: 0.07, min: -0.48, max: 0.48, step: 0.001 },
                w: { value: 0.32, min: 0.2, max: 0.92, step: 0.001 },
                fontSize: { value: 0.03, min: 0.02, max: 0.1, step: 0.001 },
                lineHeight: { value: 1.1, min: 0.85, max: 1.6, step: 0.01 },
                rotationDeg: { value: -0.1, min: -8, max: 8, step: 0.1 },
                debugBox: false,
            }),
        }
    )

    const sealZone = useMemo(() => {
        return { x: sealX, y: sealY, w: sealW, h: sealH }
    }, [sealX, sealY, sealW, sealH])

    // Force HitZone to re-mount when tweaking via Leva (HitZone intentionally doesn't react to prop changes).
    const sealKey = `${sealZone.x.toFixed(3)}:${sealZone.y.toFixed(3)}:${sealZone.w.toFixed(3)}:${sealZone.h.toFixed(3)}`

    // Load one of the textures to get its aspect ratio. (Both images share dimensions.)
    const letterTexture = useTexture(LETTER_URL)
    const letterAspect = useMemo(() => {
        const img = letterTexture.image as HTMLImageElement | undefined
        const w = img?.naturalWidth ?? 2752
        const h = img?.naturalHeight ?? 1536
        return w / h
    }, [letterTexture])

    const startOpen = () => {
        revealStartRef.current = performance.now()
        const tick = (now: number) => {
            const elapsed = now - (revealStartRef.current ?? now)
            const p = Math.min(elapsed / OPEN_DURATION_MS, 1)
            setRevealProgress(p)
            if (p < 1) rafRef.current = requestAnimationFrame(tick)
        }
        rafRef.current = requestAnimationFrame(tick)
    }

    useEffect(() => {
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
    }, [])

    // Reset all local state when leaving the location.
    useEffect(() => {
        if (!isOnLocation) {
            setClicks(0)
            setRevealProgress(0)
            setSparkBurstKey(0)
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
            rafRef.current = null
            revealStartRef.current = null
        }
    }, [isOnLocation])

    // If already completed (persisted), show the opened letter immediately on re-entry.
    useEffect(() => {
        if (!isOnLocation) return
        if (!isCompleted) return
        setClicks(10)
        setRevealProgress(1)
    }, [isOnLocation, isCompleted])

    const handleSealClick = (e: any) => {
        e.stopPropagation()
        if (!isOnLocation) return
        if (isCompleted) return
        if (revealProgress > 0) return

        setSparkBurstKey((k) => k + 1)

        setClicks((prev) => {
            const next = Math.min(prev + 1, 10)
            if (next === 10) startOpen()
            if (next === 10) {
                markJourneyCompleted('invitation')
                if (maxUnlockedIndex === index) unlockNextPuzzle()
            }
            return next
        })
    }

    const textOpacity = THREE.MathUtils.smoothstep(revealProgress, 0.25, 0.9)
    const textRotation = THREE.MathUtils.degToRad(rotationDeg)
    const burstColor = clicks >= 9 ? '#ffb07a' : BURST_COLOR

    return (
        <JourneyLocationBase
            index={index}
            position={position}
            scale={[locationScale, locationScale, 1]}
            bgUrl={ENVELOPE_URL}
            revealUrl={LETTER_URL}
            revealProgress={revealProgress}
            bobbingMode="y"
        >
            {/* Seal click target (only before opening) */}
            {isOnLocation && revealProgress === 0 && (
                <HitZone
                    key={sealKey}
                    id="invitation_seal"
                    initialX={sealZone.x}
                    initialY={sealZone.y}
                    initialW={sealZone.w}
                    initialH={sealZone.h}
                    onClick={handleSealClick}
                />
            )}

            {/* Particle burst per click (bright, larger, fades out smoothly). */}
            {isOnLocation && revealProgress === 0 && sparkBurstKey > 0 && (
                <group key={`burst:${sealKey}`} position={[sealZone.x, sealZone.y, 0.03]}>
                    <SealParticleBurst
                        triggerKey={sparkBurstKey}
                        zoneW={sealZone.w}
                        zoneH={sealZone.h}
                        color={burstColor}
                    />
                </group>
            )}

            {/* Letter text (only after opening starts) */}
            {isOnLocation && revealProgress > 0 && (
                // JourneyLayer scales children non-uniformly to normalize [-0.5..0.5] coordinates.
                // Compensate X so text doesn't look stretched (letterAspect = planeW/planeH).
                // Also push the text forward a bit so it's above the reveal (letter) layer.
                <group scale={[1 / letterAspect, 1, 1]} position={[0, 0, 0.25]}>
                    {debugBox && (
                        <mesh position={[textX * letterAspect, textY, 0]}>
                            <planeGeometry args={[textW * letterAspect, 0.6]} />
                            <meshBasicMaterial transparent opacity={0.15} color="#00d2ff" depthWrite={false} />
                        </mesh>
                    )}
                    <Text
                        font={HAND_FONT_URL}
                        position={[textX * letterAspect, textY, 0.001]}
                        rotation={[0, 0, textRotation]}
                        maxWidth={textW * letterAspect}
                        fontSize={fontSize}
                        lineHeight={lineHeight}
                        whiteSpace="normal"
                        overflowWrap="break-word"
                        textAlign="left"
                        anchorX="left"
                        anchorY="top"
                        color="#2b1d13"
                        fillOpacity={textOpacity}
                        outlineWidth={0.0015}
                        outlineColor="#000000"
                        outlineOpacity={0.12}
                    >
                        {LETTER_TEXT}
                    </Text>
                </group>
            )}
        </JourneyLocationBase>
    )
}

preloadJourneyLocation(ENVELOPE_URL)
preloadJourneyLocation(LETTER_URL)
