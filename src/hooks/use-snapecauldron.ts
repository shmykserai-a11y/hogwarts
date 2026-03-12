import { create } from 'zustand'

export type PotionType = 'livingDeath' | 'polyjuice' | 'boils'

export interface IngredientDef {
    id: string
    name: string
    url: string
}

export const POTION_RECIPES: Record<PotionType, { name: string; ingredients: string[] }> = {
    livingDeath: {
        name: 'Draught of Living Death',
        ingredients: ['asphodel_roots', 'wormwood_tincture', 'sopophorous_beans']
    },
    polyjuice: {
        name: 'Polyjuice Potion',
        ingredients: ['lacewing_flies', 'knotgrass_stalks', 'leeches', 'bicorn_horn', 'boomslang_skin', 'human_hair']
    },
    boils: {
        name: 'Cure for Boils',
        ingredients: ['dried_nettles', 'snake_fangs', 'horned_slugs', 'porcupine_quills']
    }
}

export const ALL_INGREDIENTS: IngredientDef[] = [
    { id: 'asphodel_roots', name: 'Powdered Root of Asphodel', url: '/textures/journey/snape-cauldron/ingredients/asphodel_roots.webp' },
    { id: 'wormwood_tincture', name: 'Infusion of Wormwood', url: '/textures/journey/snape-cauldron/ingredients/wormwood_tincture.webp' },
    { id: 'sopophorous_beans', name: 'Sopophorous Beans', url: '/textures/journey/snape-cauldron/ingredients/sopophorous_beans.webp' },
    { id: 'lacewing_flies', name: 'Lacewing Flies', url: '/textures/journey/snape-cauldron/ingredients/lacewing_flies.webp' },
    { id: 'knotgrass_stalks', name: 'Knotgrass Stalks', url: '/textures/journey/snape-cauldron/ingredients/knotgrass_stalks.webp' },
    { id: 'leeches', name: 'Leeches', url: '/textures/journey/snape-cauldron/ingredients/leeches.webp' },
    { id: 'bicorn_horn', name: 'Horn of Bicorn', url: '/textures/journey/snape-cauldron/ingredients/bicorn_horn.webp' },
    { id: 'boomslang_skin', name: 'Shredded Boomslang Skin', url: '/textures/journey/snape-cauldron/ingredients/boomslang_skin.webp' },
    { id: 'human_hair', name: 'Human Hair', url: '/textures/journey/snape-cauldron/ingredients/human_hair.webp' },
    { id: 'dried_nettles', name: 'Dried Nettles', url: '/textures/journey/snape-cauldron/ingredients/dried_nettles.webp' },
    { id: 'snake_fangs', name: 'Crushed Snake Fangs', url: '/textures/journey/snape-cauldron/ingredients/snake_fangs.webp' },
    { id: 'horned_slugs', name: 'Horned Slugs', url: '/textures/journey/snape-cauldron/ingredients/horned_slugs.webp' },
    { id: 'porcupine_quills', name: 'Porcupine Quills', url: '/textures/journey/snape-cauldron/ingredients/porcupine_quills.webp' },
]

type GameState = 'playing' | 'brewing' | 'success' | 'failure'

interface SnapeCauldronState {
    isActive: boolean
    targetPotion: PotionType
    addedIngredients: string[]
    gameState: GameState
    brewProgress: number // 0 to 1

    setIsActive: (active: boolean) => void
    toggleIngredient: (id: string) => void
    setBrewProgress: (progress: number) => void
    evaluateBrew: () => void
    resetGame: () => void
}

export const useSnapeCauldronStore = create<SnapeCauldronState>((set, get) => ({
    isActive: false,
    targetPotion: 'livingDeath', // Default, will be randomized on start
    addedIngredients: [],
    gameState: 'playing',
    brewProgress: 0,

    setIsActive: (active) => set({ isActive: active }),
    
    toggleIngredient: (id) => set((state) => {
        if (state.gameState !== 'playing') return state
        
        if (state.addedIngredients.includes(id)) {
            // Remove if already selected
            return { addedIngredients: state.addedIngredients.filter(i => i !== id) }
        } else {
            // Add if not selected
            return { addedIngredients: [...state.addedIngredients, id] }
        }
    }),

    setBrewProgress: (progress) => set((state) => {
        if (state.gameState === 'success' || state.gameState === 'failure') return state
        
        // If progress > 0, we are brewing. If 0, we are just playing (cancelled brew)
        return { 
            brewProgress: progress,
            gameState: progress > 0 ? 'brewing' : 'playing'
        }
    }),

    evaluateBrew: () => set((state) => {
        const recipe = POTION_RECIPES[state.targetPotion].ingredients
        const added = state.addedIngredients

        // Check if length matches and all required are present
        const isSuccess = recipe.length === added.length && recipe.every(req => added.includes(req))

        return {
            gameState: isSuccess ? 'success' : 'failure',
            brewProgress: 1
        }
    }),

    resetGame: () => {
        const potions: PotionType[] = ['livingDeath', 'polyjuice', 'boils']
        const randomPotion = potions[Math.floor(Math.random() * potions.length)]
        
        set({
            targetPotion: randomPotion,
            addedIngredients: [],
            gameState: 'playing',
            brewProgress: 0
        })
    }
}))
