'use client'

import React, { useEffect } from 'react'
import { useControls, button } from 'leva'
import { useHitZoneStore } from '@/hooks/use-hitzones'

/**
 * UniversalHitZoneDebugger
 * 
 * Replaces the old 3D mesh debugger with a logic-only component.
 * It mounts globally and binds Leva controls to the Zustand store.
 */
export function UniversalHitZoneDebugger() {
    const { 
        editMode, setEditMode, 
        selectedId, setSelectedId, 
        zones, updateZone, addZoneCallback 
    } = useHitZoneStore()

    // 1. Global tools
    useControls('1. HitZone Global', {
        editMode: {
            value: editMode,
            onChange: (v) => setEditMode(v),
            label: '✏️ Edit Mode'
        },
        addZone: button(() => {
            if (addZoneCallback) addZoneCallback()
            else console.warn("[HitZone] No addZoneCallback registered by current location.")
        }),
        logToConsole: button(() => {
            console.log("\n🧪 --- CURRENT HIT ZONES JSON --- 🧪\n")
            console.log(JSON.stringify(useHitZoneStore.getState().zones, null, 2))
            console.log("\n🧪 ------------------------------ 🧪\n")
        })
    }, [editMode, addZoneCallback])

    // 2. Zone List Picker
    // We generate options for the dropdown based on currently registered zones
    const zoneOptions = Object.keys(zones).reduce((acc, key) => {
        acc[String(key)] = key; // label -> value
        return acc;
    }, {} as Record<string, string>)

    const [, setSelectControl] = useControls('2. HitZone Selector', () => ({
        selectZone: {
            options: zoneOptions,
            value: selectedId ? String(selectedId) : '',
            onChange: (v) => setSelectedId(v),
            render: (get) => get('1. HitZone Global.editMode') === true
        }
    }), [zones, selectedId])

    // Update the dropdown if selectedId changes via clicking on the canvas
    useEffect(() => {
        if (selectedId) {
            setSelectControl({ selectZone: String(selectedId) })
        }
    }, [selectedId, setSelectControl])


    // 3. Properties of Selected Zone
    const selectedZone = selectedId ? zones[selectedId] : null

    const [, setPropControls] = useControls('3. HitZone Properties', () => ({
        x: {
            value: selectedZone?.x ?? 0,
            min: -0.5, max: 0.5, step: 0.001,
            onChange: (v) => { if (selectedId) updateZone(selectedId, { x: v }) },
            render: () => !!selectedZone
        },
        y: {
            value: selectedZone?.y ?? 0,
            min: -0.5, max: 0.5, step: 0.001,
            onChange: (v) => { if (selectedId) updateZone(selectedId, { y: v }) },
            render: () => !!selectedZone
        },
        w: {
            value: selectedZone?.w ?? 0.1,
            min: 0.01, max: 1.0, step: 0.001,
            onChange: (v) => { if (selectedId) updateZone(selectedId, { w: v }) },
            render: () => !!selectedZone
        },
        h: {
            value: selectedZone?.h ?? 0.1,
            min: 0.01, max: 1.0, step: 0.001,
            onChange: (v) => { if (selectedId) updateZone(selectedId, { h: v }) },
            render: () => !!selectedZone
        }
    }), [selectedZone?.id]) // Rebind when a different zone is selected

    // Two-way binding for when zones are dragged in the canvas
    useEffect(() => {
        if (selectedZone) {
            setPropControls({ 
                x: selectedZone.x, 
                y: selectedZone.y, 
                w: selectedZone.w, 
                h: selectedZone.h 
            })
        }
    }, [selectedZone?.x, selectedZone?.y, selectedZone?.w, selectedZone?.h, setPropControls])

    // Completely headless – no 3D rendering needed here. 
    return null
}
