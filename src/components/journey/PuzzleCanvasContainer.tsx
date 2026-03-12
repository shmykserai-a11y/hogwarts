'use client'

import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { CameraRigPuzzle } from './CameraRigPuzzle'
import { InvitationLetter } from './locations/00_InvitationLetter'
import { DiagonAlley } from './locations/00_DiagonAlley'
import { SortingHat } from './locations/00_SortingHat'
import { GreatHall } from './locations/02_GreatHall'
import { SnapeCauldron } from './locations/01_SnapeCauldron'
import { LibrarySection } from './locations/03_Library'
import { AragogForest } from './locations/05_AragogForest'
import { HippogriffMeadow } from './locations/06_HippogriffMeadow'
import { PhoenixSanctuary } from './locations/07_PhoenixSanctuary'
import { ThestralGrove } from './locations/08_ThestralGrove'
import { HagridsHut } from './locations/09_HagridsHut'
import { ZhmyrLocation } from './locations/10_Zhmyr'
import { PensieveLocation } from './locations/11_Pensieve'
import { FarewellLocation } from './locations/12_Farewell'
import { UniversalHitZoneDebugger } from './UniversalHitZoneDebugger'
import { SceneEditor } from '../3d/SceneEditor'

const isDev = process.env.NODE_ENV === 'development'

export function PuzzleCanvasContainer() {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
        }}>
            <Canvas
                camera={{ position: [0, 0, 30], fov: 60 }}
                gl={{ antialias: true }}
                style={{ background: '#0a0e17' }}
                dpr={[1, 2]}
            >
                <fog attach="fog" args={['#0a0e17', 20, 150]} />
                <ambientLight intensity={0.2} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} color="#00d2ff" />
                <pointLight position={[-10, -10, -10]} intensity={0.8} color="#aa00ff" />

                <CameraRigPuzzle />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                {/* Dev Tools — hidden in production build */}
                {/* {isDev && <SceneEditor />} */}

                {/* Journey Locations (Z-Depth 2D Layers) */}
                <InvitationLetter position={[0, 0, 60]} index={0} />
                <DiagonAlley position={[0, 0, 30]} index={1} />
                <HippogriffMeadow position={[0, 0, 0]} index={2} />
                <SortingHat position={[0, 0, -30]} index={3} />
                <GreatHall position={[0, 0, -60]} index={4} />
                <PhoenixSanctuary position={[0, 0, -90]} index={5} />
                <PensieveLocation position={[0, 0, -120]} index={6} />
                <ThestralGrove position={[0, 0, -150]} index={7} />
                <SnapeCauldron position={[0, 0, -180]} index={8} />
                <ZhmyrLocation position={[0, 0, -210]} index={9} />
                <HagridsHut position={[0, 0, -240]} index={10} />
                <AragogForest position={[0, 0, -270]} index={11} />
                <LibrarySection position={[0, 0, -300]} index={12} />
                <FarewellLocation position={[0, 0, -330]} index={13} />

                {/* Global Hit Zone Debugger */}
                {isDev && <UniversalHitZoneDebugger />}
            </Canvas>
        </div>
    )
}
