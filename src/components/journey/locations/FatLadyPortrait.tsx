'use client'

import React, { useMemo, useRef } from 'react'
import { useTexture, PresentationControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useControls, folder } from 'leva'
import { useDebugTransform } from '@/hooks/useDebugTransform'
import { withBasePath } from '@/lib/base-path'
import * as THREE from 'three'

export function FatLadyPortrait({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
    const colorMap = useTexture(withBasePath('/textures/fatlady/Fat Lady_frame_transparent.png'))
    useMemo(() => { colorMap.colorSpace = THREE.SRGBColorSpace }, [colorMap])

    // ─── Debug controls ───────────────────────────────────────────────────────
    // Using the universal useDebugTransform hook — one line to register in Leva!
    const frame = useDebugTransform('Fat Lady / Frame', {
        position: [0, -0.5, 0],
        rotation: [0, 0, 0],
    })

    // Light gets its own dedicated sliders (it has extra settings beyond transform)
    const { lightIntensity, followMouse } = useControls('Fat Lady / Light', {
        Light: folder({
            followMouse: { value: true, label: 'Follow Mouse' },
            lightIntensity: { value: 25, min: 0, max: 200, label: 'Intensity' },
        })
    })

    // ─── Moving light ─────────────────────────────────────────────────────────
    const lightRef = useRef<THREE.PointLight>(null)
    useFrame(({ pointer, viewport }) => {
        if (!lightRef.current) return
        if (followMouse) {
            lightRef.current.position.x = THREE.MathUtils.lerp(
                lightRef.current.position.x, (pointer.x * viewport.width) / 2, 0.1
            )
            lightRef.current.position.y = THREE.MathUtils.lerp(
                lightRef.current.position.y, (pointer.y * viewport.height) / 2, 0.1
            )
        }
    })

    return (
        <group position={new THREE.Vector3(...position)}>
            <PresentationControls
                global snap rotation={[0, 0, 0]}
                polar={[-Math.PI / 6, Math.PI / 6]}
                azimuth={[-Math.PI / 8, Math.PI / 8]}
            >
                <mesh
                    name="Fat Lady Frame"
                    castShadow
                    receiveShadow
                    position={frame.position}
                    rotation={new THREE.Euler(...frame.rotation)}
                >
                    <planeGeometry args={[4, 7.5]} />
                    <meshStandardMaterial
                        map={colorMap}
                        transparent alphaTest={0.5}
                        side={THREE.DoubleSide}
                        roughness={0.7} metalness={0.2}
                    />
                </mesh>
            </PresentationControls>

            <pointLight ref={lightRef} position={[0, 0, 1.5]}
                intensity={lightIntensity} color="#ffffff" distance={20} decay={1}>
                <mesh>
                    <sphereGeometry args={[0.2]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
            </pointLight>

            <ambientLight intensity={0.2} />
        </group>
    )
}
