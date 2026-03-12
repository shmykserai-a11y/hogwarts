'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { useStore } from '@/lib/store'

export function GryffindorInterior() {
    const { activeRoom } = useStore()
    const groupRef = useRef<THREE.Group>(null)

    // Render the interior far away from the hallway
    return (
        <group ref={groupRef} position={[1000, 0, 0]}>
            {/* Room Geometry - Placeholder */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[10, 5, 12]} />
                <meshStandardMaterial color="#3e0c0c" side={THREE.BackSide} />
            </mesh>

            {/* Fireplace / Light source */}
            <mesh position={[0, -1, -5]}>
                <boxGeometry args={[2, 2, 1]} />
                <meshStandardMaterial color="#883311" emissive="#ff5500" emissiveIntensity={2} />
                <pointLight color="#ffccaa" intensity={3} distance={15} />
            </mesh>

            <Html position={[0, 1, -5]} center>
                <div style={{ textAlign: 'center', color: '#ffdddd', textShadow: '0 0 10px #ff0000', pointerEvents: 'none' }}>
                    <h2 className="heading-magic" style={{ fontSize: '2.5rem', margin: 0 }}>Gryffindor Common Room</h2>
                    <p style={{ fontStyle: 'italic', opacity: 0.8 }}>Warm and cozy by the fire...</p>
                </div>
            </Html>

            {/* A floating book or artifact */}
            <mesh position={[-2, -0.5, -2]}>
                <boxGeometry args={[0.5, 0.1, 0.4]} />
                <meshStandardMaterial color="#aa2222" />
            </mesh>

            <mesh position={[2, -0.5, -3]}>
                <sphereGeometry args={[0.4, 16, 16]} />
                <meshStandardMaterial color="#ddb52f" metalness={0.8} roughness={0.2} />
            </mesh>
        </group>
    )
}
