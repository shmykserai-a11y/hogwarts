/**
 * useDebugTransform — Universal debug hook for any 3D object
 *
 * Usage:
 *   const { position, rotation } = useDebugTransform('Location / Object Name', {
 *     position: [0, 0, 0],
 *     rotation: [0, 0, 0],  // optional
 *   })
 *
 * In production (NODE_ENV === 'production'), Leva UI is hidden globally
 * and this hook simply returns the provided default values with zero overhead.
 */

import { useControls, button, folder } from 'leva'
import { useMemo } from 'react'

type Vec3 = [number, number, number]

interface DebugTransformOptions {
    /** Default world position [x, y, z] */
    position?: Vec3
    /** Default Euler rotation [x, y, z] in radians */
    rotation?: Vec3
    /** Default scale [x, y, z] — defaults to [1,1,1] */
    scale?: Vec3
    /** Start collapsed in Leva (default: true) */
    collapsed?: boolean
}

interface DebugTransformResult {
    position: Vec3
    rotation: Vec3
    scale: Vec3
}

const DEFAULT_POS: Vec3 = [0, 0, 0]
const DEFAULT_ROT: Vec3 = [0, 0, 0]
const DEFAULT_SCL: Vec3 = [1, 1, 1]

export function useDebugTransform(
    name: string,
    options: DebugTransformOptions = {}
): DebugTransformResult {
    const {
        position = DEFAULT_POS,
        rotation = DEFAULT_ROT,
        scale = DEFAULT_SCL,
        collapsed = true,
    } = options

    // useMemo prevents re-creating schema on every render
    const schema = useMemo(() => ({
        Transform: folder({
            position: { value: position, step: 0.1, label: 'Position (xyz)' },
            rotation: { value: rotation, step: 0.05, label: 'Rotation (xyz)' },
            scale: { value: scale, step: 0.05, label: 'Scale (xyz)' },
        }, { collapsed: false }),
        '⎘ Copy Code': button((get) => {
            const pos = get(`${name}.position`) as Vec3
            const rot = get(`${name}.rotation`) as Vec3
            const scl = get(`${name}.scale`) as Vec3
            const code = [
                `position={[${pos.map(v => v.toFixed(3)).join(', ')}]}`,
                rot.some(v => v !== 0) ? `rotation={[${rot.map(v => v.toFixed(3)).join(', ')}]}` : null,
                scl.some((v, i) => v !== DEFAULT_SCL[i]) ? `scale={[${scl.map(v => v.toFixed(3)).join(', ')}]}` : null,
            ].filter(Boolean).join(' ')
            navigator.clipboard.writeText(code)
            console.log(`[Debug] ${name}:\n  ${code}`)
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), []) // stable schema — values updated via Leva's own state

    const values = useControls(name, schema, { collapsed })

    return {
        position: (values.position as Vec3) ?? position,
        rotation: (values.rotation as Vec3) ?? rotation,
        scale: (values.scale as Vec3) ?? scale,
    }
}
