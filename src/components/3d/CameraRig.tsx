'use client'

import { useThree, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { useLocationIndex } from '@/hooks/use-scroll-progress'
import { useStore } from '@/lib/store'

// Camera travels from Z=38 (8 units before Great Hall) → Z=-262 (8 units before Hogsmeade)
// Spacing between exactly 11 locations is exactly 30 units
const START_Z = 38
const END_Z = -262

/**
 * ✏️  ADDING A NEW LOCATION
 * 1. Append the camera approach Z-coordinate (8 units BEFORE the object's Z).
 *    e.g. object at Z=-180 → camera at Z=-172
 * 2. Increment TOTAL_LOCATIONS in use-scroll-progress.ts by 1.
 * That's it!
 */
const LOCATION_CAMERA_Z: number[] = [
    38,    // Great Hall        (object at Z=30,   camera 8 units ahead)
    8,     // Staircases        (object at Z=0,    camera 8 units ahead)
    -22,   // Common Rooms      (object at Z=-30,  camera 8 units ahead)
    -52,   // Room of Requirement (object at Z=-60)
    -82,   // Forbidden Forest  (object at Z=-90)
    -112,  // Library           (object at Z=-120)
    -142,  // Pensieve          (object at Z=-150)
    -172,  // Cat Corner        (object at Z=-180)
    -202,  // Quidditch Pitch   (object at Z=-210)
    -232,  // Hagrid's Hut      (object at Z=-240)
    -262,  // Hogsmeade         (object at Z=-270)
]

export function CameraRig() {
    const { camera } = useThree()
    const locationIndex = useLocationIndex()
    const { activeRoom } = useStore()

    // Create stable targets for the room cameras
    const roomTargets = useRef({
        gryffindor: { pos: new THREE.Vector3(1000, 1.5, 5), rotY: 0 }
    })

    useFrame(() => {
        // If we teleported into a room, DO NOT apply the scroll logic to camera.
        // Instead, lerp the camera to the room's interior coordinates.
        if (activeRoom === 'gryffindor') {
            const targetPos = roomTargets.current.gryffindor.pos
            const targetRotY = roomTargets.current.gryffindor.rotY

            // Fast lerp so it feels like a quick transition / dive
            camera.position.lerp(targetPos, 0.05)
            camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, targetRotY, 0.05)
            return
        }

        if (activeRoom !== 'hallway') return

        // Interpolate between location Z positions using the fractional index
        const floorIdx = Math.floor(locationIndex)
        const ceilIdx = Math.min(floorIdx + 1, LOCATION_CAMERA_Z.length - 1)
        const frac = locationIndex - floorIdx

        const startZ = LOCATION_CAMERA_Z[floorIdx]
        const endZ = LOCATION_CAMERA_Z[ceilIdx]
        const targetZ = THREE.MathUtils.lerp(startZ, endZ, frac)

        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.08)

        // Return X and Y rot to 0 in case we just exited a room that offset them
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, 0.08)
        camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, 0, 0.08)

        // Subtle Y bob
        const normalizedProgress = locationIndex / (LOCATION_CAMERA_Z.length - 1)
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, Math.sin(normalizedProgress * Math.PI) * 0.3, 0.05)
    })

    return null
}
