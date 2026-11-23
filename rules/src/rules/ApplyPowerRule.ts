import { isMoveItem, ItemMove, MaterialMove, PlayerTurnRule } from '@gamepark/rules-api'
import { Cell, sameCell } from '../material/Grid'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { Power } from '../material/Power'
import { endTurn } from './EndTurn'
import { getMapping, GridMove, pushPath } from './GridMove'
import { atCell, GridState } from './GridState'
import { Memory } from './Memory'
import { RuleId } from './RuleId'

type MoveOrigin = { cell: Cell; itemType: MaterialType; itemIndex: number; push: boolean }

/**
 * [R-4.3] The active player applies the power of the card they just flipped. There is always a legal move here.
 * A swap is played by moving one card onto the other: the other card then takes its place.
 * A push is played by moving the played card to the end of its row or column where it comes back in: the cards between slide towards the hole.
 */
export class ApplyPowerRule extends PlayerTurnRule<number, MaterialType, LocationType, RuleId> {
  get played(): Cell {
    return this.remind<Cell>(Memory.PlayedCell)
  }

  /** Nothing to play while the move of the player is being completed: a cell of the grid can be empty for a moment. */
  getPlayerMoves() {
    if (this.remind(Memory.MoveOrigin)) return []
    const state = new GridState(this.game)
    return state.powerMoves(this.played).flatMap((move): MaterialMove<number, MaterialType, LocationType>[] => {
      if ('push' in move) return [this.moveTo(state, move.push.from, move.push.to)]
      const [a, b] = move.swap
      return [this.moveTo(state, a, b), this.moveTo(state, b, a)]
    })
  }

  moveTo(state: GridState, from: Cell, to: Cell) {
    return state.cardAt(from).moveItem((item) => ({ ...item.location, x: to.x, y: to.y }))
  }

  beforeItemMove(move: ItemMove<number, MaterialType, LocationType>) {
    if (!isMoveItem(move) || this.remind(Memory.MoveOrigin)) return []
    const { x, y } = this.material(move.itemType).getItem(move.itemIndex).location
    const push = this.remind(Memory.PlayedPower) === Power.Push
    this.memorize<MoveOrigin>(Memory.MoveOrigin, { cell: { x: x!, y: y! }, itemType: move.itemType, itemIndex: move.itemIndex, push })
    return []
  }

  /** The first card moved by the player completes the swap or the push; the moves that follow are its consequences. */
  afterItemMove(move: ItemMove<number, MaterialType, LocationType>) {
    const origin = this.remind<MoveOrigin | undefined>(Memory.MoveOrigin)
    if (!isMoveItem(move) || !origin || move.itemType !== origin.itemType || move.itemIndex !== origin.itemIndex) return []
    const destination = { x: move.location.x!, y: move.location.y! }
    const gridMove: GridMove = origin.push ? { push: { from: origin.cell, to: destination } } : { swap: [origin.cell, destination] }
    const moves = 'push' in gridMove ? this.pushConsequences(gridMove.push.from, gridMove.push.to) : this.othersAt(destination).map((other) => other.moveItem((item) => ({ ...item.location, ...origin.cell })))
    this.memorize(Memory.LastMove, getMapping(gridMove))
    return [...moves, ...endTurn(this)]
  }

  /** The cards in a cell, except the card the player moved there. */
  othersAt(cell: Cell) {
    const origin = this.remind<MoveOrigin>(Memory.MoveOrigin)
    return [MaterialType.ElementCard, MaterialType.ElementisCard]
      .map((type) => atCell(this.material(type), cell).filter((_, index) => type !== origin.itemType || index !== origin.itemIndex))
      .filter((material) => material.length > 0)
  }

  /** The cards between the edge and the hole slide one cell towards the hole, the closest to the hole first. */
  pushConsequences(from: Cell, to: Cell) {
    const path = pushPath({ from, to })
    return path
      .slice(0, -1)
      .reverse()
      .flatMap((cell) => {
        const next = path[path.findIndex((other) => sameCell(other, cell)) + 1]
        return this.othersAt(cell).map((other) => other.moveItem((item) => ({ ...item.location, ...next })))
      })
  }

  onRuleEnd() {
    this.forget(Memory.PlayedCell)
    this.forget(Memory.PlayedPower)
    this.forget(Memory.MoveOrigin)
    return []
  }
}
