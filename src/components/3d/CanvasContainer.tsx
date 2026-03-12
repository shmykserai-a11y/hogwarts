'use client'

import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { CameraRig } from './CameraRig'
import { GreatHall } from './GreatHall'
import { CommonRooms } from './CommonRooms'
import { DynamicStaircases } from './DynamicStaircases'
import { RoomOfRequirement } from './RoomOfRequirement'
import { ForbiddenForest } from './ForbiddenForest'
import { GryffindorInterior } from './rooms/GryffindorInterior'
import { Library } from './Library'
import { Pensieve } from './Pensieve'
import { CatCorner } from './CatCorner'
import { QuidditchArena } from './QuidditchArena'
import { HagridsHut } from './HagridsHut'
import { Hogsmeade } from './Hogsmeade'
import { SceneEditor } from './SceneEditor'

const isDev = process.env.NODE_ENV === 'development'

export function CanvasContainer() {
    return (
        // Fixed canvas behind the DOM — no zIndex needed when body is transparent
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            // Do NOT set zIndex: -1 — that pushes behind body background
        }}>
            <Canvas
                camera={{ position: [0, 0, 30], fov: 60 }}
                gl={{ antialias: true }}
                style={{ background: '#0a0e17' }}
                dpr={[1, 2]}
            >
                {/* Fog: hides objects beyond ~22 units — extended for Hogsmeade visibility */}
                <fog attach="fog" args={['#0a0e17', 5, 22]} />
                {/* Lights */}
                <ambientLight intensity={0.3} />
                <directionalLight position={[10, 10, 5]} intensity={1.2} color="#00d2ff" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#aa00ff" />

                {/* Dev Tools */}
                {isDev && <SceneEditor />}

                {/* Camera Z-axis scrolling */}
                <CameraRig />

                {/* Star field background */}
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                {/* Locations along the Z axis - spaced by 30 units to prevent overlap */}
                <GreatHall position={[0, 0, 30]} />
                <DynamicStaircases position={[0, 0, 0]} />
                <CommonRooms position={[0, 0, -30]} />
                <RoomOfRequirement position={[0, 0, -60]} />
                <ForbiddenForest position={[0, 0, -90]} />

                {/* Phase 7: The Academic Wing (The Library) */}
                <Library />

                {/* Phase 8: The Headmaster's Tower (The Pensieve) */}
                <Pensieve position={[0, -2, -150]} />

                {/* Phase 9: The Courtyard (Cat Corner) */}
                <CatCorner position={[0, -2, -180]} />

                {/* Phase 10: The Quidditch Pitch */}
                <QuidditchArena position={[0, -2, -210]} />

                {/* Phase 11: The Grounds (Hagrid's Hut) */}
                <HagridsHut position={[0, -2, -240]} />

                {/* Phase 12: The Village (Hogsmeade) */}
                <Hogsmeade position={[0, -2, -270]} />

                {/* Remote Interiors */}
                <GryffindorInterior />
            </Canvas>
        </div>
    )
}
