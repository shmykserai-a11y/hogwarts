'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '@/lib/store'
import { Html } from '@react-three/drei'
import { useLocationIndex } from '@/hooks/use-scroll-progress'

export function Pensieve({ position = [0, -2, -150] }: { position?: [number, number, number] }) {
    const groupRef = useRef<THREE.Group>(null)
    const liquidRef = useRef<THREE.Mesh>(null)
    const { setActiveMemoryUrl } = useStore()
    const locationIndex = useLocationIndex()
    const isVisible = Math.abs(locationIndex - 6) < 0.8 // 7th location (index 6)

    // Base video to play for the memory
    const memoryVideoUrl = 'https://www.w3schools.com/html/mov_bbb.mp4' // placeholder video

    // Create a custom shader material for the swirling liquid
    const liquidMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                colorA: { value: new THREE.Color("#445588") },
                colorB: { value: new THREE.Color("#88ccff") },
                glow: { value: new THREE.Color("#cceeff") }
            },
            vertexShader: `
                varying vec2 vUv;
                varying vec3 vPosition;
                void main() {
                    vUv = uv;
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 colorA;
                uniform vec3 colorB;
                uniform vec3 glow;
                varying vec2 vUv;
                varying vec3 vPosition;

                // Simple 2D noise
                float random (in vec2 st) {
                    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
                }

                void main() {
                    // Swirl effect
                    vec2 center = vec2(0.5, 0.5);
                    vec2 uv = vUv - center;
                    float angle = atan(uv.y, uv.x);
                    float radius = length(uv);

                    angle += time * 0.5 - radius * 5.0; // Swirl math

                    vec2 swirlUv = vec2(cos(angle), sin(angle)) * radius + center;

                    // Wave pattern
                    float wave = sin(swirlUv.x * 20.0 + time) * cos(swirlUv.y * 20.0 - time);

                    vec3 finalColor = mix(colorA, colorB, wave * 0.5 + 0.5);

                    // Add central glow
                    float centerGlow = 1.0 - smoothstep(0.0, 0.4, radius);
                    finalColor = mix(finalColor, glow, centerGlow * 0.8);

                    gl_FragColor = vec4(finalColor, 0.9);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        })
    }, [])

    useFrame((state) => {
        if (liquidMaterial) {
            liquidMaterial.uniforms.time.value = state.clock.getElapsedTime()
        }
        if (groupRef.current) {
            // Gentle floating of the entire basin
            groupRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime()) * 0.1
        }
    })

    return (
        <group ref={groupRef} position={new THREE.Vector3(...position)}>
            {/* Ambient eerie light */}
            <pointLight position={[0, 2, 0]} intensity={2} color="#88ccff" distance={10} />

            {/* Basin Stand */}
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[1, 1.5, 1, 16]} />
                <meshStandardMaterial color="#222222" roughness={0.8} metalness={0.2} />
            </mesh>

            {/* Basin Bowl (Rotated PI to be a bowl instead of a dome) */}
            <mesh position={[0, 1.5, 0]} rotation={[Math.PI, 0, 0]} castShadow receiveShadow>
                <sphereGeometry args={[1.6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                <meshStandardMaterial color="#333333" roughness={0.6} side={THREE.DoubleSide} />
            </mesh>

            {/* The Swirling Liquid */}
            <mesh
                ref={liquidRef}
                position={[0, 1.4, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                material={liquidMaterial}
                onClick={() => isVisible && setActiveMemoryUrl(memoryVideoUrl)}
                onPointerOver={() => isVisible && (document.body.style.cursor = 'pointer')}
                onPointerOut={() => isVisible && (document.body.style.cursor = 'auto')}
            >
                <circleGeometry args={[1.55, 32]} />
            </mesh>

            {/* Title / Instruction */}
            {isVisible && (
                <Html position={[0, 3, 0]} center distanceFactor={12} zIndexRange={[100, 0]}>
                    <div style={{
                        color: '#88ccff',
                        fontFamily: "'Cinzel', serif",
                        fontSize: '1.2rem',
                        textShadow: '0 0 10px #88ccff',
                        pointerEvents: 'none',
                        userSelect: 'none',
                        textAlign: 'center'
                    }}>
                        The Pensieve
                        <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '4px' }}>
                            Click the surface to view memories
                        </div>
                    </div>
                </Html>
            )}
        </group>
    )
}
