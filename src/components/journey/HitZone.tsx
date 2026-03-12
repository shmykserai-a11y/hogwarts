'use client'

import React, { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { ThreeEvent, useFrame } from '@react-three/fiber'
import { Sparkles, Edges } from '@react-three/drei'
import { useHitZoneStore } from '@/hooks/use-hitzones'

interface HitZoneProps {
    id: number | string
    /** 
     * Initial normalized X position (-0.5 left, 0 center, 0.5 right)
     */
    initialX: number
    /** 
     * Initial normalized Y position (-0.5 bottom, 0 center, 0.5 top)
     */
    initialY: number
    /**
     * Initial normalized width (0.1 = 10% of background width)
     */
    initialW: number
    /**
     * Initial normalized height (0.1 = 10% of background height)
     */
    initialH: number

    onClick?: (e: ThreeEvent<MouseEvent>) => void
    onPointerDown?: (e: ThreeEvent<PointerEvent>) => void
    onPointerUp?: (e: ThreeEvent<PointerEvent>) => void
    onPointerOut?: (e: ThreeEvent<PointerEvent>) => void
    isHighlighted?: boolean
    /** 
     * Allows consumers to forcefully disable normal click if they want.
     */
    disabled?: boolean 
}

export function HitZone({ 
    id, initialX, initialY, initialW, initialH, 
    onClick, onPointerDown, onPointerUp, onPointerOut,
    isHighlighted, disabled 
}: HitZoneProps) {
    const meshRef = useRef<THREE.Mesh>(null)
    
    // Global editor store
    const { editMode, selectedId, setSelectedId, zones, registerZone, unregisterZone, updateZone } = useHitZoneStore()

    // Internal state for dragging
    const [isDragging, setIsDragging] = useState(false)
    const [dragOffset, setDragOffset] = useState<THREE.Vector2 | null>(null)

    // Register on mount
    useEffect(() => {
        registerZone({ id, x: initialX, y: initialY, w: initialW, h: initialH })
        return () => unregisterZone(id)
    }, [id]) // intentionally missing initial* dependencies so it only runs once

    // Current zone data
    const zone = zones[id]
    const activeX = zone?.x ?? initialX
    const activeY = zone?.y ?? initialY
    const activeW = zone?.w ?? initialW
    const activeH = zone?.h ?? initialH
    
    // We bind to document to catch pointer up outside the mesh
    useEffect(() => {
        if (!isDragging || !editMode) return

        const handlePointerUp = () => {
             setIsDragging(false)
        }

        window.addEventListener('pointerup', handlePointerUp)
        return () => window.removeEventListener('pointerup', handlePointerUp)
    }, [isDragging, editMode])

    const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
        if (!editMode) {
             if (onPointerDown && !disabled) onPointerDown(e)
             return
        }
        e.stopPropagation()
        setSelectedId(id)

        if (meshRef.current) {
            // Parent scale is the size of the background image in world units
            const parentScale = meshRef.current.parent?.scale

            if (parentScale) {
                // To get normalized drag offset, we must operate in local space (-0.5 to 0.5)
                const localPoint = meshRef.current.parent!.worldToLocal(e.point.clone())
                setDragOffset(new THREE.Vector2(
                    localPoint.x - activeX,
                    localPoint.y - activeY
                ))
                setIsDragging(true)
                ;(e.target as any).setPointerCapture(e.pointerId);
            }
        }
    }

    const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
        if (!editMode || !isDragging || !dragOffset) return
        e.stopPropagation()

        if (meshRef.current) {
            const localPoint = meshRef.current.parent!.worldToLocal(e.point.clone())
            
            const newX = localPoint.x - dragOffset.x
            const newY = localPoint.y - dragOffset.y

            // Continuously update store
            updateZone(id, { x: newX, y: newY })
        }
    }

    // Determine opacity and color
    const isSelected = selectedId === id
    let targetOpacity = 0.0
    let targetColor = "#ffff00"

    if (editMode) {
        targetOpacity = isDragging ? 0.8 : (isSelected ? 0.6 : 0.4)
        targetColor = isSelected ? "#00ff00" : (isDragging ? "#ff0000" : "#ffaa00")
    }
    
    // We only register puzzles clicks if we are NOT in edit mode
    const handleInternalClick = (e: ThreeEvent<MouseEvent>) => {
        if (editMode) {
            e.stopPropagation()
            return
        }
        if (onClick && !disabled) {
             onClick(e)
        }
    }

    const handlePointerUpInternal = (e: ThreeEvent<PointerEvent>) => {
         if (!editMode && onPointerUp && !disabled) {
              onPointerUp(e)
         }
    }

    const handlePointerOutInternal = (e: ThreeEvent<PointerEvent>) => {
        if (editMode) {
            e.stopPropagation()
            document.body.style.cursor = 'auto'
            return
        }
        if (!disabled) {
             if (onPointerOut) onPointerOut(e)
             document.body.style.cursor = 'auto'
        }
    }

    return (
        <mesh 
            ref={meshRef}
            // Z=0.01 relative to the scaled background group
            position={[activeX, activeY, 0.01]}
            onClick={handleInternalClick}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUpInternal}
            onPointerOver={(e) => {
                if (editMode || !disabled) e.stopPropagation()
                if (editMode) {
                    document.body.style.cursor = isDragging ? 'grabbing' : 'grab'
                } else if (!disabled && (onClick || onPointerDown)) {
                    document.body.style.cursor = 'pointer'
                }
            }}
            onPointerOut={handlePointerOutInternal}
        >
            <planeGeometry args={[activeW, activeH]} />
            <meshBasicMaterial 
                color={targetColor} 
                transparent 
                opacity={targetOpacity} 
                depthWrite={false}
                blending={!editMode && isHighlighted ? THREE.AdditiveBlending : THREE.NormalBlending}
            />

            {/* Magical Visual Feedback */}
            {!editMode && isHighlighted && (
                <>
                    {/* Golden sparks rising up */}
                    <Sparkles 
                        count={40} 
                        scale={[activeW, activeH * 1.5, 0.05]} 
                        size={6} 
                        noise={0.5}
                        speed={0.6} 
                        opacity={1} 
                        color="#ffdd55" 
                        position={[0, 0, 0.02]} 
                    />
                </>
            )}
        </mesh>
    )
}
