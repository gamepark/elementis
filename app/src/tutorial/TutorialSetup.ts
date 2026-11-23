import { ElementisOptions } from '@gamepark/elementis/ElementisOptions'
import { ElementisSetup } from '@gamepark/elementis/ElementisSetup'
import { Element, elements } from '@gamepark/elementis/material/Element'
import { Cell, gridCells, sameCell } from '@gamepark/elementis/material/Grid'
import { LocationType } from '@gamepark/elementis/material/LocationType'
import { MaterialType } from '@gamepark/elementis/material/MaterialType'
import { Power } from '@gamepark/elementis/material/Power'
import { RuleId } from '@gamepark/elementis/rules/RuleId'
import { shuffle } from 'es-toolkit'

export const me = 1

/** The 6 powers of the script. */
const tutorialPowers = [Power.RowSwap, Power.Push, Power.DiagonalSwap, Power.AdjacentSwap, Power.ElementisSwap, Power.PlayedAdjacentSwap]

/** The Elementis card is in the middle of the grid. */
export const elementisCell: Cell = { x: 2, y: 2 }
/** Turn 1: the player flips the card above the Elementis card, a Water card whose power swaps it with an adjacent card. */
export const firstCell: Cell = { x: 2, y: 1 }
/** Turn 2: the player flips a second Water card next to the first one, then swaps the Elementis card with its neighbour on the left. */
export const secondCell: Cell = { x: 2, y: 3 }
/** Turn 3: the player flips a Fire card with the push power. */
export const pushCell: Cell = { x: 3, y: 2 }

/** The cards of the script, the others are dealt at random in the other cells. */
const scripted: [Cell, Element, Power][] = [
  [firstCell, Element.Water, Power.PlayedAdjacentSwap],
  [secondCell, Element.Water, Power.AdjacentSwap],
  [pushCell, Element.Fire, Power.Push]
]

/** The start of the script is fixed: the powers of the game, the Elementis card and the 3 cards flipped first. */
export class TutorialSetup extends ElementisSetup {
  setupMaterial(_options: ElementisOptions) {
    this.material(MaterialType.HelpCard).createItems(
      [...tutorialPowers].sort((a, b) => a - b).map((id, x) => ({ id, location: { type: LocationType.HelpCards, x } }))
    )
    this.material(MaterialType.ElementisCard).createItem({ location: { type: LocationType.Grid, ...elementisCell } })
    const free = shuffle(gridCells.filter((cell) => !sameCell(cell, elementisCell) && !scripted.some(([scriptCell]) => sameCell(cell, scriptCell))))
    const others = tutorialPowers
      .flatMap((back) => elements.map((front) => ({ front, back })))
      .filter(({ front, back }) => !scripted.some(([, element, power]) => element === front && power === back))
    this.material(MaterialType.ElementCard).createItems([
      ...scripted.map(([cell, front, back]) => ({ id: { front, back }, location: { type: LocationType.Grid, ...cell } })),
      ...shuffle(others).map((id, i) => ({ id, location: { type: LocationType.Grid, ...free[i] } }))
    ])
  }

  start() {
    this.startPlayerTurn(RuleId.FlipCard, me)
  }
}
