/**
 * Single source of truth for the number of journey locations.
 * Update this when adding or removing a location.
 * Both the scroll system and the unlock system read from here automatically.
 */
import { JOURNEY_SEQUENCE } from './journey-sequence'

export const TOTAL_PUZZLES = JOURNEY_SEQUENCE.length
