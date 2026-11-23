import { Material, MaterialGame, MaterialRulesPart } from '@gamepark/rules-api'
import { Element, elements } from '../material/Element'
import { Cell, GRID_SIZE, gridCells, orthogonalNeighbors, sameCell } from '../material/Grid'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { Power } from '../material/Power'
import { Board, GridMove, isAnchor, legalMoves, Mapping, Slot } from './GridMove'
import { Memory } from './Memory'
import { RuleId } from './RuleId'

type Game = MaterialGame<number, MaterialType, LocationType>

export type ElementCardId = { front?: Element; back: Power }

/** Victory when the score reaches 22 out of 24 (F8, decision of the publisher). */
export const WIN_THRESHOLD = 22

/** The cards of a material in a cell of the grid. */
export const atCell = (material: Material<number, MaterialType, LocationType>, cell: Cell) =>
  material.location((location) => location.type === LocationType.Grid && location.x === cell.x && location.y === cell.y)

/** Reads the grid and gives the possible choices of a turn. */
export class GridState extends MaterialRulesPart<number, MaterialType, LocationType, RuleId> {
  constructor(game: Game) {
    super(game)
  }

  get elementCards() {
    return this.material(MaterialType.ElementCard).location(LocationType.Grid)
  }

  get elementisCard() {
    return this.material(MaterialType.ElementisCard)
  }

  /** The Element cards still on their power side. */
  get hiddenCards() {
    return this.elementCards.location((location) => !location.rotation)
  }

  /** The card (Element or Elementis) in a cell. */
  cardAt(cell: Cell): Material<number, MaterialType, LocationType> {
    const elementis = atCell(this.elementisCard, cell)
    return elementis.length ? elementis : atCell(this.elementCards, cell)
  }

  /** A snapshot of the visible content of the 25 cells, read once. */
  get board(): Board {
    const slots: Slot[] = Array(GRID_SIZE * GRID_SIZE).fill({ kind: 'hidden' })
    const index = ({ x, y }: { x?: number; y?: number }) => y! * GRID_SIZE + x!
    for (const item of this.elementCards.getItems<ElementCardId>()) {
      if (item.location.rotation) slots[index(item.location)] = { kind: 'revealed', element: item.id.front }
    }
    for (const item of this.elementisCard.getItems()) slots[index(item.location)] = { kind: 'elementis' }
    // P-7: the played card waiting beside the board still counts in the cell it left
    const pushed = this.pushedCard.getItem<ElementCardId>()
    if (pushed) slots[index(this.remind<Cell>(Memory.PlayedCell))] = { kind: 'revealed', element: pushed.id.front }
    return (cell) => slots[cell.y * GRID_SIZE + cell.x]
  }

  /** P-7: the played card removed from the grid, waiting beside the board to be inserted back. */
  get pushedCard() {
    return this.material(MaterialType.ElementCard).location(LocationType.PushedCard)
  }

  get lastMove(): Mapping | undefined {
    return this.remind<Mapping | undefined>(Memory.LastMove)
  }

  /** The cards on their power side orthogonally adjacent to a card on its element side or to the Elementis card [R-4.1]. */
  get flippableCells(): Cell[] {
    const board = this.board
    return gridCells.filter((cell) => board(cell).kind === 'hidden' && orthogonalNeighbors(cell).some((neighbor) => isAnchor(board(neighbor))))
  }

  powerAt(cell: Cell): Power {
    return atCell(this.elementCards, cell).getItem<ElementCardId>()!.id.back
  }

  /**
   * [C-1] A card whose power cannot be applied cannot be played. Its playability is judged BEFORE it is flipped, with the visible
   * information only: the card is supposed to be on its element side, element unknown (F7).
   */
  get playableCells(): Cell[] {
    const board = this.board
    return this.flippableCells.filter((played) => {
      const afterFlip: Board = (cell) => (sameCell(cell, played) ? { kind: 'revealed' } : board(cell))
      return legalMoves(afterFlip, this.powerAt(played), played, this.lastMove).length > 0
    })
  }

  /** The legal moves of the power of the card just flipped, its element now visible. */
  powerMoves(played: Cell, power = this.powerAt(played)): GridMove[] {
    return legalMoves(this.board, power, played, this.lastMove)
  }

  /** [R-8] For each element, the cells of its largest zone of orthogonally adjacent cards. The Elementis card neither scores nor links (F14). */
  largestZone(element: Element): Cell[] {
    const board = this.board
    const isOf = (cell: Cell) => {
      const slot = board(cell)
      return slot.kind === 'revealed' && slot.element === element
    }
    const seen = new Set<string>()
    const key = (cell: Cell) => `${cell.x},${cell.y}`
    let best: Cell[] = []
    for (const start of gridCells) {
      if (seen.has(key(start)) || !isOf(start)) continue
      const zone: Cell[] = []
      const queue = [start]
      seen.add(key(start))
      while (queue.length) {
        const cell = queue.shift()!
        zone.push(cell)
        for (const neighbor of orthogonalNeighbors(cell)) {
          if (!seen.has(key(neighbor)) && isOf(neighbor)) {
            seen.add(key(neighbor))
            queue.push(neighbor)
          }
        }
      }
      if (zone.length > best.length) best = zone
    }
    return best
  }

  /** [R-8] 1 point per card of the largest zone of each element, 24 at most. */
  get score(): number {
    return elements.reduce((sum, element) => sum + this.largestZone(element).length, 0)
  }
}
