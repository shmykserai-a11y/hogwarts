'use client'

import { useThree, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { usePuzzleLocationIndex } from '@/hooks/use-puzzle-scroll'
import { TOTAL_PUZZLES } from '@/config/journey'

// Camera Z for each location: formula is 68 - index * 30
// This array is auto-generated from TOTAL_PUZZLES so adding a new location
// only requires updating config/journey.ts
const LOCATION_CAMERA_Z: number[] = Array.from(
    { length: TOTAL_PUZZLES },
    (_, i) => 68 - i * 30
)

export function CameraRigPuzzle() {
    const { camera } = useThree()
    const locationIndex = usePuzzleLocationIndex()

    useFrame(() => {
        // Interpolate between location Z positions using the fractional index
        const floorIdx = Math.floor(locationIndex)
        const ceilIdx = Math.min(floorIdx + 1, LOCATION_CAMERA_Z.length - 1)
        const frac = locationIndex - floorIdx

        const startZ = LOCATION_CAMERA_Z[floorIdx]
        const endZ = LOCATION_CAMERA_Z[ceilIdx]
        const targetZ = THREE.MathUtils.lerp(startZ, endZ, frac)

        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08)

        // Return X and Y rot to 0
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, 0.08)
        camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, 0, 0.08)

        // Subtle Y bob
        const normalizedProgress = locationIndex / (LOCATION_CAMERA_Z.length - 1 || 1)
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, Math.sin(normalizedProgress * Math.PI) * 0.3, 0.05)
    })

    return null
}
