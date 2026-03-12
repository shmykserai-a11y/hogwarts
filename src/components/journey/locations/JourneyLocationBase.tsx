'use client'

import React, { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { usePuzzleLocationIndex } from '@/hooks/use-puzzle-scroll'

export interface JourneyLayerProps {
    textureUrl: string
    localZ: number
    opacity: number
    focusedCameraZ: number
    groupZ: number
    materialRef?: React.Ref<THREE.MeshBasicMaterial>
    sizeMultiplier?: number
    meshRef?: React.Ref<THREE.Mesh>
    fog?: boolean
}

export function JourneyLayer({ 
    textureUrl, localZ, opacity, focusedCameraZ, groupZ, 
    materialRef, sizeMultiplier = 1.1, meshRef, fog = true,
    children 
}: JourneyLayerProps & { children?: React.ReactNode }) {
    const texture = useTexture(textureUrl)
    const { camera, size } = useThree()

    const { planeW, planeH } = useMemo(() => {
        const absoluteZ = groupZ + localZ
        // Distance from camera to this plane when focused on this location
        const dist = Math.abs(focusedCameraZ - absoluteZ)

        const fov = (camera as THREE.PerspectiveCamera).fov
        const fovInRadians = (fov * Math.PI) / 180
        // Calculate frustum height at 'dist' depth
        const viewHeight = Math.abs(2 * Math.tan(fovInRadians / 2) * dist)
        const viewWidth = viewHeight * (size.width / size.height)

        // Get native aspect ratio of the loaded image
        const img = texture.image as HTMLImageElement | null
        const imgAspect = (img?.naturalWidth || 16) / (img?.naturalHeight || 9)
        const viewAspect = size.width / size.height

        let w = viewWidth
        let h = viewHeight

        // Ensure 'cover' scaling behavior
        if (viewAspect > imgAspect) {
            h = w / imgAspect
        } else {
            w = h * imgAspect
        }

        // Apply multiplier (1.0 = exact 100% cover, >1.0 = overscan for parallax)
        return { planeW: w * sizeMultiplier, planeH: h * sizeMultiplier }
    }, [texture, camera, size.width, size.height, focusedCameraZ, groupZ, localZ, sizeMultiplier])

    const innerMatRef = useRef<THREE.MeshBasicMaterial>(null)

    useFrame(() => {
        if (innerMatRef.current) {
            innerMatRef.current.opacity = THREE.MathUtils.lerp(innerMatRef.current.opacity, opacity, 0.1)
        }
    })

    // Helper to merge refs
    const setMatRef = (m: THREE.MeshBasicMaterial | null) => {
        (innerMatRef as any).current = m
        if (materialRef) {
            if (typeof materialRef === 'function') materialRef(m)
            else (materialRef as any).current = m
        }
    }

    return (
        <group position={[0, 0, localZ]}>
            <mesh ref={meshRef}>
                <planeGeometry args={[planeW, planeH]} />
                <meshBasicMaterial
                    ref={setMatRef}
                    map={texture}
                    transparent
                    depthWrite={false}
                    toneMapped={false}
                    side={THREE.DoubleSide}
                    opacity={0} // Start at 0, lerp in useFrame
                    fog={fog}
                />
            </mesh>
            {/* Normalize local coordinate system relative to the texture size */}
            {children && (
                <group scale={[planeW, planeH, 1]}>
                    {children}
                </group>
            )}
        </group>
    )
}

export interface JourneyLocationConfig {
    index: number
    position: [number, number, number]
    scale?: [number, number, number]
    bgUrl: string
    /** Optional foreground layer. Omit for background-only locations. */
    fgUrl?: string
    /**
     * 'y'   = feather float on Y axis (default)
     * 'z'   = slow forward/back breathing on Z axis
     * 'none' = static (no animation)
     */
    bobbingMode?: 'y' | 'z' | 'none'
    /** @deprecated use bobbingMode='none' */
    disableBobbing?: boolean
    children?: React.ReactNode
    fgChildren?: React.ReactNode
    /** Optional image to crossfade to (e.g. puzzle solved reveal). 0=bg only, 1=reveal only. */
    revealUrl?: string
    revealProgress?: number
}

export function JourneyLocationBase({ index, position, scale = [1, 1, 1], bgUrl, fgUrl, bobbingMode, disableBobbing = false, children, fgChildren, revealUrl, revealProgress = 0 }: JourneyLocationConfig) {
    const groupRef = useRef<THREE.Group>(null)
    const timeRef = useRef(0)
    const locationIndex = usePuzzleLocationIndex()

    // Resolve effective bobbing mode (support legacy disableBobbing prop)
    const effectiveMode: 'y' | 'z' | 'none' = bobbingMode ?? (disableBobbing ? 'none' : 'y')

    // Camera Z positions: 68, 38, 8 (decreasing by 30 per location starting from index 0)
    const focusedCameraZ = 68 - index * 30

    // Deeper Z spread for more parallax
    const bgLocalZ = -15
    const fgLocalZ = 0

    // For z-bobbing: fg is only ~8 units from camera, so ±1.5 unit movement changes
    // apparent size significantly (8/9.5 = 84%). Use larger multiplier to prevent edge gaps.
    const bgSizeMultiplier = effectiveMode === 'none' ? 1.0 : 1.1
    const fgSizeMultiplier = effectiveMode === 'z' ? 1.3 : effectiveMode === 'none' ? 1.0 : 1.1

    const dist = Math.abs(locationIndex - index)
    // Fade out completely when scrolled more than 60% towards the next
    const targetOpacity = dist < 0.6 ? 1 - (dist / 0.6) : 0

    useFrame((state, delta) => {
        if (!groupRef.current) return
        timeRef.current += delta

        if (effectiveMode === 'y') {
            // Feather float — gentle vertical sine
            groupRef.current.position.y = position[1] + Math.sin(timeRef.current * 0.4) * 0.3
            groupRef.current.position.z = position[2]
        } else if (effectiveMode === 'z') {
            // Breathing zoom — slow forward / back sine (~18s period, ±1.5 units)
            groupRef.current.position.y = position[1]
            groupRef.current.position.z = position[2] + Math.sin(timeRef.current * 0.175) * 1.5
        } else {
            groupRef.current.position.y = position[1]
            groupRef.current.position.z = position[2]
        }

        // Optimization: hide entirely when opacity is nearly zero
        groupRef.current.visible = targetOpacity > 0.01 || dist < 1.0
    })

    return (
        <group ref={groupRef} position={position} scale={scale}>
            {(targetOpacity > 0.01 || dist < 1.0) && (
                <>
                    <JourneyLayer
                        textureUrl={bgUrl}
                        localZ={bgLocalZ}
                        opacity={Math.max(0, targetOpacity) * (1 - revealProgress)}
                        focusedCameraZ={focusedCameraZ}
                        groupZ={position[2]}
                        sizeMultiplier={bgSizeMultiplier}
                    >
                        {children}
                    </JourneyLayer>
                    {/* Reveal crossfade layer — sits just in front of bg */}
                    {revealUrl && revealProgress > 0 && (
                        <JourneyLayer
                            textureUrl={revealUrl}
                            localZ={bgLocalZ + 0.1}
                            opacity={Math.max(0, targetOpacity) * revealProgress}
                            focusedCameraZ={focusedCameraZ}
                            groupZ={position[2]}
                            sizeMultiplier={bgSizeMultiplier}
                        />
                    )}
                    {fgUrl && (
                        <JourneyLayer
                            textureUrl={fgUrl}
                            localZ={fgLocalZ}
                            opacity={Math.max(0, targetOpacity)}
                            focusedCameraZ={focusedCameraZ}
                            groupZ={position[2]}
                            sizeMultiplier={fgSizeMultiplier}
                        >
                            {fgChildren}
                        </JourneyLayer>
                    )}
                </>
            )}
        </group>
    )
}

export function preloadJourneyLocation(bgUrl: string, fgUrl?: string) {
    useTexture.preload(bgUrl)
    if (fgUrl) useTexture.preload(fgUrl)
}
