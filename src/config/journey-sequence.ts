export type JourneyLocationKey =
    | 'invitation'
    | 'diagon'
    | 'hippogriff'
    | 'sorting_hat'
    | 'great_hall_candles'
    | 'phoenix'
    | 'pensieve'
    | 'thestral'
    | 'snape_cauldron'
    | 'zhmyr'
    | 'hagrids_hut'
    | 'aragog'
    | 'library'
    | 'farewell'

export type JourneyLocationMeta = {
    key: JourneyLocationKey
    title: string
    gated: boolean
    gateHint?: string
}

// Keep this order in sync with `PuzzleCanvasContainer`.
export const JOURNEY_SEQUENCE: JourneyLocationMeta[] = [
    { key: 'invitation', title: 'Invitation Letter', gated: true, gateHint: 'Open the envelope to continue' },
    { key: 'diagon', title: 'Diagon Alley', gated: true, gateHint: 'Solve the puzzle to continue' },
    { key: 'hippogriff', title: 'Hippogriff Meadow', gated: false },
    { key: 'sorting_hat', title: 'Sorting Hat', gated: true, gateHint: 'Answer the Sorting Hat to continue' },
    { key: 'great_hall_candles', title: 'Great Hall (Candles)', gated: true, gateHint: 'Catch the candles to continue' },
    { key: 'phoenix', title: 'Phoenix Sanctuary', gated: false },
    { key: 'pensieve', title: 'Pensieve', gated: true, gateHint: 'Guess all 10 memories to continue' },
    { key: 'thestral', title: 'Thestral Grove', gated: false },
    { key: 'snape_cauldron', title: "Snape's Cauldron", gated: true, gateHint: 'Brew the potion to continue' },
    { key: 'zhmyr', title: 'Zhmyr', gated: false },
    { key: 'hagrids_hut', title: "Hagrid's Hut", gated: true, gateHint: 'Find all items in time to continue' },
    { key: 'aragog', title: 'Aragog Forest', gated: false },
    { key: 'library', title: 'Library', gated: true, gateHint: 'Hold for 3 minutes to continue' },
    { key: 'farewell', title: 'Farewell', gated: false },
] as const
