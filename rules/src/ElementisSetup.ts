import { MaterialGameSetup } from '@gamepark/rules-api'
import { sample, sampleSize, shuffle } from 'es-toolkit'
import { ElementisOptions } from './ElementisOptions'
import { ElementisRules } from './ElementisRules'
import { elements } from './material/Element'
import { gridCells } from './material/Grid'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { powers, POWERS_PER_GAME } from './material/Power'
import { Memory } from './rules/Memory'
import { RuleId } from './rules/RuleId'

/**
 * This class creates a new Game based on the game options
 */
export class ElementisSetup extends MaterialGameSetup<number, MaterialType, LocationType, ElementisOptions> {
  Rules = ElementisRules

  /**
   * [R-3] Draw 6 Help cards at random: they give the powers of the game. Take the 24 Element cards of these powers (4 per power),
   * add an Elementis card, shuffle them, then lay them in a grid of 5 × 5 cards, power side up.
   */
  setupMaterial(options: ElementisOptions) {
    if (options.expert) this.memorize(Memory.Expert, true)
    const gamePowers = sampleSize(powers, POWERS_PER_GAME).sort((a, b) => a - b)
    this.material(MaterialType.HelpCard).createItems(gamePowers.map((id, x) => ({ id, location: { type: LocationType.HelpCards, x } })))
    const [elementisCell, ...cells] = shuffle(gridCells)
    this.material(MaterialType.ElementisCard).createItem({ location: { type: LocationType.Grid, ...elementisCell } })
    // Shuffled before they are created: the index of a card, seen by everyone, must not tell its hidden element
    const cards = shuffle(gamePowers.flatMap((back) => elements.map((front) => ({ front, back }))))
    this.material(MaterialType.ElementCard).createItems(cards.map((id, i) => ({ id, location: { type: LocationType.Grid, ...cells[i] } })))
  }

  /** The first player is chosen at random (F19). */
  start() {
    this.startPlayerTurn(RuleId.FlipCard, sample(this.players))
  }
}
