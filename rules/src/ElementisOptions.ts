import { OptionsSpecV2 } from '@gamepark/rules-api'

/**
 * This is the type of object that the game receives when a new game is started.
 */
export type ElementisOptions = {
  players: number
  /** Expert mode: the size of the largest zone of each element is not shown during the game, only at the end. */
  expert?: boolean
}

/**
 * The structure of everything a host can choose before the game starts — and nothing else.
 * Texts live in `app/public/options/<locale>.json`.
 * A cooperative game for 1 or 2 players [R-2]. No player identities: the players are only numbered, as in Djeser.
 */
export const ElementisOptionsSpecV2: OptionsSpecV2 = {
  specVersion: 2,
  players: { min: 1, max: 2 },
  options: {
    expert: { kind: 'boolean' }
  }
}
