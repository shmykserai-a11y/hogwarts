import { useFrame, useThree } from '@react-three/fiber'
import { useRef, useState } from 'react'
import * as THREE from 'three'

const tempVec = new THREE.Vector3()

/**
 * Returns opacity 0-1 based on how close the camera is to `worldPosition`.
 * Objects fade in when camera is within `showDistance` and become fully visible at `fullDistance`.
 */
export function useProximityOpacity(
    worldPosition: [number, number, number],
    showDistance = 12,
    fullDistance = 6
) {
    const { camera } = useThree()
    const [opacity, setOpacity] = useState(0)

    useFrame(() => {
        tempVec.set(...worldPosition)
        const dist = camera.position.distanceTo(tempVec)
        const raw = 1 - THREE.MathUtils.clamp((dist - fullDistance) / (showDistance - fullDistance), 0, 1)
        // Avoid too many state updates
        setOpacity((prev) => {
            const next = Math.round(raw * 100) / 100
            return Math.abs(next - prev) > 0.02 ? next : prev
        })
    })

    return opacity
}
