'use client'

import React, { useRef, useState, useEffect } from 'react'
import { useTexture, PresentationControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// The hit zones (4 from screenshots, 2 arbitrary added to make 6)
const HIT_ZONES = [
    { id: 0, x: 1.05, y: 0.70, w: 0.8, h: 0.4 },
    { id: 1, x: 2.77, y: 0.73, w: 0.8, h: 0.4 },
    { id: 2, x: 3.24, y: -0.26, w: 0.8, h: 0.4 },
    { id: 3, x: 1.07, y: -1.39, w: 0.8, h: 0.4 },
    { id: 4, x: 1.75, y: -0.38, w: 0.8, h: 0.4 },
    { id: 5, x: 2.30, y: -1.05, w: 0.8, h: 0.4 }, // 6th arbitrary zone
]

// helper to shuffle array
function shuffle(array: number[]) {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
}

export function BrickWallTest({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
    // В React Three Fiber (и Three.js) лучшей практикой для "плоского рельефа" 
    // является использование PBR-материалов (Physically Based Rendering) с картами нормалей (Normal Maps).
    // Мы загрузим 3 текстуры из открытых примеров Three.js:
    // 1. Diffuse (Цвет)
    // 2. Normal / Bump (Рельеф) - говорит свету, как отражаться
    // 3. Roughness (Шероховатость) - делает кирпич матовым, а цемент немного другим

    // Загружаем текстуры
    const [colorMap, bumpMap, roughnessMap] = useTexture([
        'https://threejs.org/examples/textures/brick_diffuse.jpg',
        'https://threejs.org/examples/textures/brick_bump.jpg', // Three.js примеры используют bump, принцип тот же
        'https://threejs.org/examples/textures/brick_roughness.jpg'
    ])

    // Повторяем текстуру по поверхности, чтобы кирпичи не были гигантскими
    React.useMemo(() => {
        [colorMap, bumpMap, roughnessMap].forEach(texture => {
            texture.wrapS = THREE.RepeatWrapping
            texture.wrapT = THREE.RepeatWrapping
            texture.repeat.set(2, 2)
            texture.colorSpace = THREE.SRGBColorSpace
        })
    }, [colorMap, bumpMap, roughnessMap])

    // Ссылка на источник света, чтобы двигать его
    const lightRef = useRef<THREE.PointLight>(null)

    // State for the puzzle
    const [sequence, setSequence] = useState<number[]>([])
    const [currentStep, setCurrentStep] = useState(0)

    useEffect(() => {
        // Generate random sequence on mount
        setSequence(shuffle([0, 1, 2, 3, 4, 5]))
        setCurrentStep(0)
    }, [])

    const handleZoneClick = (id: number) => {
        if (sequence.length === 0) return

        if (id === sequence[currentStep]) {
            // Correct click
            const nextStep = currentStep + 1
            setCurrentStep(nextStep)
            
            if (nextStep === sequence.length) {
                // Puzzle solved!
                console.log("Diagon Alley entrance opened!")
            }
        } else {
            // Incorrect click - Reset sequence progress
            setCurrentStep(0)
        }
    }

    // Анимируем свет вслед за мышью
    useFrame(({ pointer, viewport }) => {
        if (lightRef.current) {
            const targetX = (pointer.x * viewport.width) / 2
            const targetY = (pointer.y * viewport.height) / 2

            // Плавное следование за курсором
            lightRef.current.position.x = THREE.MathUtils.lerp(lightRef.current.position.x, targetX, 0.1)
            lightRef.current.position.y = THREE.MathUtils.lerp(lightRef.current.position.y, targetY, 0.1)
        }
    })

    return (
        <group position={new THREE.Vector3(...position)}>
            <PresentationControls
                global
                snap={true}
                rotation={[0, 0, 0]}
                polar={[-Math.PI / 6, Math.PI / 6]}
                azimuth={[-Math.PI / 6, Math.PI / 6]}
            >
                {/* 
                    ИСПОЛЬЗУЕМ 1 ПОЛИГОН (2 треугольника).
                    args={[ширина, высота]} без дополнительных сегментов.
                */}
                <mesh receiveShadow castShadow>
                    <planeGeometry args={[15, 10]} />
                    <meshStandardMaterial
                        map={colorMap}
                        bumpMap={bumpMap}          // Создает иллюзию рельефа
                        bumpScale={0.05}           // Сила рельефа
                        roughnessMap={roughnessMap} // Делает материал реалистично-матовым
                        metalness={0.1}
                    />
                </mesh>

                {/* Hit Zones */}
                {HIT_ZONES.map((zone) => {
                    const isHighlighted = sequence.length > 0 && currentStep > sequence.indexOf(zone.id)
                    return (
                        <mesh 
                            key={zone.id} 
                            position={[zone.x, zone.y, 0.05]} // Slightly in front of the wall
                            onClick={(e) => {
                                e.stopPropagation()
                                handleZoneClick(zone.id)
                            }}
                            onPointerOver={(e) => {
                                e.stopPropagation()
                                document.body.style.cursor = 'pointer'
                            }}
                            onPointerOut={(e) => {
                                e.stopPropagation()
                                document.body.style.cursor = 'auto'
                            }}
                        >
                            <planeGeometry args={[zone.w, zone.h]} />
                            <meshBasicMaterial 
                                color="#ffff00" 
                                transparent 
                                opacity={isHighlighted ? 0.6 : 0.2} // Visible by default
                                depthWrite={false}
                            />
                        </mesh>
                    )
                })}
            </PresentationControls>

            {/* Красный точечный свет, чтобы наглядно показать, как тень ложится на плоский "рельеф" */}
            <pointLight ref={lightRef} position={[2, 0, 1.5]} intensity={5} color="#ff3300" distance={10}>
                <mesh>
                    <sphereGeometry args={[0.2]} />
                    <meshBasicMaterial color="#ff3300" />
                </mesh>
            </pointLight>

            {/* Синий свет, движущийся по стене */}
            <pointLight position={[-3, 2, 2]} intensity={4} color="#0088ff" distance={10} />
        </group>
    )
}
