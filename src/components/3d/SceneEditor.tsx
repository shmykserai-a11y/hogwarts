'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import { TransformControls } from '@react-three/drei'
import { useControls, button } from 'leva'
import * as THREE from 'three'

/**
 * SceneEditor Component
 * Provides a global way to select and move objects in the scene during development.
 */
export function SceneEditor() {
    const { scene, raycaster, camera, mouse } = useThree()
    const [selected, setSelected] = useState<THREE.Object3D | null>(null)

    // Leva controls for the inspector
    const [, setInspector] = useControls('Scene Inspector', () => ({
        selectedName: { value: 'None', editable: false, label: 'Selected' },
        position: { value: [0, 0, 0], editable: false, label: 'Position' },
        rotation: { value: [0, 0, 0], editable: false, label: 'Rotation' },
        copyPath: button(() => {
            if (selected) {
                const pos = selected.position
                const rot = selected.rotation
                const output = `position={[${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)}]} rotation={[${rot.x.toFixed(2)}, ${rot.y.toFixed(2)}, ${rot.z.toFixed(2)}]}`
                navigator.clipboard.writeText(output)
                console.log('Copied to clipboard:', output)
            }
        })
    }), [selected])

    const onPointerDown = useCallback((e: any) => {
        // Only trigger if clicking directly on a mesh (and not meta-keys like shift)
        if (e.button !== 0) return

        // Check intersections
        raycaster.setFromCamera(mouse, camera)
        const intersects = raycaster.intersectObjects(scene.children, true)

        if (intersects.length > 0) {
            let obj = intersects[0].object
            // Try to find the parent if this is just a geometry part of a group
            while (obj.parent && obj.parent !== scene && !obj.name) {
                obj = obj.parent
            }
            setSelected(obj)
            setInspector({
                selectedName: obj.name || obj.type,
                position: [obj.position.x, obj.position.y, obj.position.z],
                rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z]
            })
            console.log('Selected:', obj)
        } else {
            setSelected(null)
            setInspector({ selectedName: 'None', position: [0, 0, 0], rotation: [0, 0, 0] })
        }
    }, [raycaster, mouse, camera, scene, setInspector])

    useEffect(() => {
        window.addEventListener('pointerdown', onPointerDown)
        return () => window.removeEventListener('pointerdown', onPointerDown)
    }, [onPointerDown])

    // Update Leva when TransformControls changes the object
    const onTransform = useCallback(() => {
        if (selected) {
            setInspector({
                position: [selected.position.x, selected.position.y, selected.position.z],
                rotation: [selected.rotation.x, selected.rotation.y, selected.rotation.z]
            })
        }
    }, [selected, setInspector])

    return (
        <>
            {selected && (
                <TransformControls
                    object={selected}
                    onObjectChange={onTransform}
                    mode="translate" // You can add a Leva switch to toggle between translate/rotate/scale
                />
            )}
        </>
    )
}
