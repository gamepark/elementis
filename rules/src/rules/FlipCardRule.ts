import { isMoveItemType, ItemMove, PlayerTurnRule } from '@gamepark/rules-api'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { endTurn } from './EndTurn'
import { GridState } from './GridState'
import { Memory } from './Memory'
import { RuleId } from './RuleId'

/**
 * [R-4.1] Choose a card on its power side orthogonally adjacent to a card on its element side or to the Elementis card.
 * [R-4.2] Flip it on its element side.
 * [C-1] Only a card whose power can be applied can be chosen; if no card can, any of them is flipped without effect.
 */
export class FlipCardRule extends PlayerTurnRule<number, MaterialType, LocationType, RuleId> {
  getPlayerMoves() {
    const state = new GridState(this.game)
    const playable = state.playableCells
    const cells = playable.length ? playable : state.flippableCells
    return cells.map((cell) => state.cardAt(cell).moveItem((item) => ({ ...item.location, rotation: true })))
  }

  /**
   * [R-4.3] Apply its power: it is compulsory as soon as it is possible. The element now visible can make it impossible: then it has
   * no effect (F7). A card flipped without effect never has a possible power: its element can only remove moves.
   */
  afterItemMove(move: ItemMove<number, MaterialType, LocationType>) {
    if (!isMoveItemType(MaterialType.ElementCard)(move)) return []
    const played = { x: move.location.x!, y: move.location.y! }
    if (new GridState(this.game).powerMoves(played).length) {
      this.memorize(Memory.PlayedCell, played)
      return [this.startRule(RuleId.ApplyPower)]
    }
    this.forget(Memory.LastMove)
    return endTurn(this)
  }
}
