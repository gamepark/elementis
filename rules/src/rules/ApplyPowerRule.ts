import { isMoveItem, ItemMove, MaterialMove, PlayerTurnRule } from '@gamepark/rules-api'
import { Cell, entryCell, entryOf, sameCell } from '../material/Grid'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { Power } from '../material/Power'
import { endTurn } from './EndTurn'
import { getMapping, pushPath } from './GridMove'
import { atCell, GridState } from './GridState'
import { Memory } from './Memory'
import { RuleId } from './RuleId'

type MoveOrigin = { cell: Cell; itemType: MaterialType; itemIndex: number }

/**
 * [R-4.3] The active player applies the power of the card they just flipped. There is always a legal move here.
 * A swap is played by moving one card onto the other: the other card then takes its place.
 * A push (P-7) is played in 2 steps: the played card leaves the grid and waits beside the board, then the player chooses the end of
 * its row or column where it goes back in, from outside the grid; the cards between slide towards the hole.
 */
export class ApplyPowerRule extends PlayerTurnRule<number, MaterialType, LocationType, RuleId> {
  get played(): Cell {
    return this.remind<Cell>(Memory.PlayedCell)
  }

  get power(): Power {
    return this.remind<Power>(Memory.PlayedPower)
  }

  /** P-7 "Remove the played card": it waits beside the board. */
  onRuleStart() {
    if (this.power !== Power.Push) return []
    return [new GridState(this.game).cardAt(this.played).moveItem({ type: LocationType.PushedCard })]
  }

  /** Nothing to play while a move is being completed: a cell of the grid can be empty for a moment. */
  getPlayerMoves() {
    if (this.remind(Memory.MoveOrigin)) return []
    const state = new GridState(this.game)
    const moves = state.powerMoves(this.played, this.power)
    if (this.power === Power.Push) {
      if (!state.pushedCard.length) return []
      return moves.flatMap((move) => ('push' in move ? [state.pushedCard.moveItem({ type: LocationType.GridEntry, ...entryOf(move.push) })] : []))
    }
    return moves.flatMap((move): MaterialMove<number, MaterialType, LocationType>[] => {
      if (!('swap' in move)) return []
      const [a, b] = move.swap
      return [this.moveTo(state, a, b), this.moveTo(state, b, a)]
    })
  }

  moveTo(state: GridState, from: Cell, to: Cell) {
    return state.cardAt(from).moveItem((item) => ({ ...item.location, x: to.x, y: to.y }))
  }

  /** A swap: the cell the first card leaves, until the other card takes it. */
  beforeItemMove(move: ItemMove<number, MaterialType, LocationType>) {
    if (!isMoveItem(move) || move.location.type !== LocationType.Grid || this.power === Power.Push || this.remind(Memory.MoveOrigin)) return []
    const { x, y } = this.material(move.itemType).getItem(move.itemIndex).location
    this.memorize<MoveOrigin>(Memory.MoveOrigin, { cell: { x: x!, y: y! }, itemType: move.itemType, itemIndex: move.itemIndex })
    return []
  }

  afterItemMove(move: ItemMove<number, MaterialType, LocationType>) {
    if (!isMoveItem(move)) return []
    if (move.location.type === LocationType.GridEntry) return this.pushIn(move.itemIndex, entryCell({ x: move.location.x!, y: move.location.y! }))
    const origin = this.remind<MoveOrigin | undefined>(Memory.MoveOrigin)
    if (!origin || move.location.type !== LocationType.Grid || move.itemType !== origin.itemType || move.itemIndex !== origin.itemIndex) return []
    const destination = { x: move.location.x!, y: move.location.y! }
    this.memorize(Memory.LastMove, getMapping({ swap: [origin.cell, destination] }))
    const others = [MaterialType.ElementCard, MaterialType.ElementisCard]
      .map((type) => atCell(this.material(type), destination).filter((_, index) => type !== origin.itemType || index !== origin.itemIndex))
      .filter((material) => material.length > 0)
    return [...others.map((other) => other.moveItem((item) => ({ ...item.location, ...origin.cell }))), ...endTurn(this)]
  }

  /**
   * P-7 "insert it from the outside by pushing the cards towards the hole": the cards between the end and the hole slide one cell
   * towards the hole, the closest to the hole first, then the played card goes in at the end.
   */
  pushIn(itemIndex: number, to: Cell) {
    const from = this.played
    this.memorize(Memory.LastMove, getMapping({ push: { from, to } }))
    const state = new GridState(this.game)
    const path = pushPath({ from, to })
    const slides = path
      .slice(0, -1)
      .reverse()
      .map((cell) => {
        const next = path[path.findIndex((other) => sameCell(other, cell)) + 1]
        return state.cardAt(cell).moveItem((item) => ({ ...item.location, ...next }))
      })
    const comeIn = this.material(MaterialType.ElementCard).index(itemIndex).moveItem({ type: LocationType.Grid, ...to, rotation: true })
    return [...slides, comeIn, ...endTurn(this)]
  }

  onRuleEnd() {
    this.forget(Memory.PlayedCell)
    this.forget(Memory.PlayedPower)
    this.forget(Memory.MoveOrigin)
    return []
  }
}
