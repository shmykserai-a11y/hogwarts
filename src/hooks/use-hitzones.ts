import { create } from 'zustand'

export interface HitZoneData {
    id: string | number
    x: number
    y: number
    w: number
    h: number
}

interface HitZoneState {
    editMode: boolean
    setEditMode: (mode: boolean) => void

    selectedId: string | number | null
    setSelectedId: (id: string | number | null) => void

    zones: Record<string | number, HitZoneData>
    
    // Called by HitZone components on mount/update to register themselves
    registerZone: (zone: HitZoneData) => void
    
    // Called by Leva or HitZone Dragging to update coordinates
    updateZone: (id: string | number, updates: Partial<HitZoneData>) => void
    
    // Remove a zone
    unregisterZone: (id: string | number) => void

    // A callback provided by the current location to handle "Add Zone" from the debugger
    addZoneCallback: (() => void) | null
    setAddZoneCallback: (cb: (() => void) | null) => void
}

export const useHitZoneStore = create<HitZoneState>((set) => ({
    editMode: false,
    setEditMode: (mode) => set({ editMode: mode, selectedId: null }),

    selectedId: null,
    setSelectedId: (id) => set({ selectedId: id }),

    zones: {},

    registerZone: (zone) => set((state) => ({
        zones: { ...state.zones, [zone.id]: zone }
    })),

    updateZone: (id, updates) => set((state) => {
        const existing = state.zones[id]
        if (!existing) return state
        return {
            zones: {
                ...state.zones,
                [id]: { ...existing, ...updates }
            }
        }
    }),

    unregisterZone: (id) => set((state) => {
        const newZones = { ...state.zones }
        delete newZones[id]
        return { zones: newZones }
    }),

    addZoneCallback: null,
    setAddZoneCallback: (cb) => set({ addZoneCallback: cb })
}))
