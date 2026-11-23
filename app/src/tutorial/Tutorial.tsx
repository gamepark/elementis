import { Cell } from '@gamepark/elementis/material/Grid'
import { LocationType } from '@gamepark/elementis/material/LocationType'
import { MaterialType } from '@gamepark/elementis/material/MaterialType'
import { MaterialTutorial, TutorialStep } from '@gamepark/react-game'
import { isMoveItem, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'
import { elementisCell, firstCell, me, pushCell, secondCell, TutorialSetup } from './TutorialSetup'

type Game = MaterialGame<number, MaterialType, LocationType>
type Move = MaterialMove<number, MaterialType, LocationType>

const components = { bold: <strong />, italic: <em /> }
const text = (key: string) => () => <Trans i18nKey={key} components={components} />

/** Around what is focused, so that the table does not zoom in too much and the popup has room. */
const margin = { top: 4, bottom: 4, left: 4, right: 4 }

/** Turn 3: the Fire card comes back in from the right of its row, and the card at the end slides into the hole. */
const pushEntry = { type: LocationType.GridEntry, x: 5, y: pushCell.y }

/**
 * A solo game: the player plays every turn (F20), there is no bot in Elementis.
 * Turn 1 flips a card next to the Elementis card and swaps them; turn 2 flips a second Water card and moves the Elementis card;
 * turn 3 shows the push; then the score help, and the player finishes the game.
 */
export class Tutorial extends MaterialTutorial<number, MaterialType, LocationType> {
  version = 1
  options = { players: 1 }
  setup = new TutorialSetup()

  players = [{ id: me }]

  /** The card (Element or Elementis) in a cell. */
  private cardAt = (game: Game, { x, y }: Cell) => {
    const at = (type: MaterialType) => this.material(game, type).location((location) => location.type === LocationType.Grid && location.x === x && location.y === y)
    const elementis = at(MaterialType.ElementisCard)
    return elementis.length ? elementis : at(MaterialType.ElementCard)
  }

  private cards = (game: Game, cells: Cell[]) => cells.map((cell) => this.cardAt(game, cell))

  /** The card in a cell is flipped. */
  private flip = (cell: Cell) => (move: Move) => isMoveItem(move) && move.location.rotation === true && move.location.x === cell.x && move.location.y === cell.y && move.location.type === LocationType.Grid

  /** The card in a cell is moved onto another cell: a swap. */
  private swap = (from: Cell, to: Cell) => (move: Move, game: Game) => {
    if (!isMoveItem(move) || move.location.type !== LocationType.Grid || move.location.x !== to.x || move.location.y !== to.y) return false
    const { x, y } = this.material(game, move.itemType).getItem(move.itemIndex).location
    return x === from.x && y === from.y
  }

  private pushTo = (move: Move) => isMoveItem(move) && move.location.type === pushEntry.type && move.location.x === pushEntry.x && move.location.y === pushEntry.y

  steps: TutorialStep<number, MaterialType, LocationType>[] = [
    { popup: { text: text('tuto.welcome') } },
    { popup: { text: text('tuto.goal') } },
    {
      popup: { text: text('tuto.grid'), position: { x: 30 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.ElementCard)], margin })
    },
    {
      popup: { text: text('tuto.help-cards'), position: { x: 30 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.HelpCard)], margin })
    },
    {
      popup: { text: text('tuto.turn'), position: { x: 30 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.ElementisCard)], margin })
    },
    {
      popup: { text: text('tuto.flip.first'), position: { x: 30 } },
      focus: (game) => ({ materials: [this.cardAt(game, firstCell), this.material(game, MaterialType.ElementisCard)], margin }),
      move: { filter: this.flip(firstCell) }
    },
    {
      popup: { text: text('tuto.power.first'), position: { x: 30 } },
      focus: (game) => ({ materials: this.cards(game, [firstCell, elementisCell]), margin }),
      move: { filter: this.swap(firstCell, elementisCell) }
    },
    {
      popup: { text: text('tuto.flip.second'), position: { x: 30 } },
      focus: (game) => ({ materials: this.cards(game, [secondCell]), margin }),
      move: { filter: this.flip(secondCell) }
    },
    {
      popup: { text: text('tuto.zone'), position: { x: 30 } },
      focus: (game) => ({ materials: this.cards(game, [elementisCell, secondCell, firstCell, { x: firstCell.x - 1, y: firstCell.y }]), margin }),
      move: { filter: this.swap(firstCell, { x: firstCell.x - 1, y: firstCell.y }) }
    },
    {
      popup: { text: text('tuto.last-move'), position: { x: 30 } },
      focus: (game) => ({ materials: this.cards(game, [firstCell, { x: firstCell.x - 1, y: firstCell.y }]), margin })
    },
    {
      popup: { text: text('tuto.flip.push'), position: { x: 30 } },
      focus: (game) => ({ materials: this.cards(game, [pushCell]), margin }),
      move: { filter: this.flip(pushCell) }
    },
    {
      popup: { text: text('tuto.push'), position: { x: -30 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.ElementCard).location(LocationType.PushedCard)], locations: [pushEntry], margin }),
      move: { filter: this.pushTo }
    },
    { popup: { text: text('tuto.score') } },
    { popup: { text: text('tuto.go') } }
  ]
}
