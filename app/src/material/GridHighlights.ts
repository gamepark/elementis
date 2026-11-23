import { css } from '@emotion/react'
import { sameCell } from '@gamepark/elementis/material/Grid'
import { LocationType } from '@gamepark/elementis/material/LocationType'
import { MaterialType } from '@gamepark/elementis/material/MaterialType'
import { Power } from '@gamepark/elementis/material/Power'
import { Mapping } from '@gamepark/elementis/rules/GridMove'
import { Memory } from '@gamepark/elementis/rules/Memory'
import { RuleId } from '@gamepark/elementis/rules/RuleId'
import { ItemContext } from '@gamepark/react-game'
import { isMoveItem, MaterialItem, MaterialMove } from '@gamepark/rules-api'

type Context = ItemContext<number, MaterialType, LocationType>

/** The legal moves of the player who looks at the table, computed once per state of the game (the state can change in place). */
let movesCache: { key: string; moves: MaterialMove<number, MaterialType, LocationType>[] } | undefined
const myMoves = (context: Context) => {
  const { items, rule, memory } = context.rules.game
  const key = JSON.stringify([context.player, items, rule, memory])
  if (movesCache?.key !== key) {
    const moves = context.player !== undefined && context.rules.isTurnToPlay(context.player) ? context.rules.getLegalMoves(context.player) : []
    movesCache = { key, moves }
  }
  return movesCache.moves
}

/** A card the player can play: flip it, move it to apply the power of the card just flipped, or click it to push the played card in there. */
export const canPlay = (context: Context) =>
  myMoves(context).some((move) => (isMoveItem(move) && move.itemType === context.type && move.itemIndex === context.index) || isPushTo(move, context))

/** A push of the played card (P-7) going in at the cell of this card. */
export const isPushTo = (move: MaterialMove<number, MaterialType, LocationType>, context: Context) => {
  if (context.rules.remind(Memory.PlayedPower) !== Power.Push || !isMoveItem(move) || move.itemType !== MaterialType.ElementCard) return false
  const { x, y } = context.rules.material(context.type).getItem(context.index).location
  return move.location.x === x && move.location.y === y
}

/** The cells where the cards moved by the power of the previous turn arrived: putting them back is forbidden [R-5b]. */
const isMovedLastTurn = (item: MaterialItem<number, LocationType>, context: Context) => {
  const lastMove = context.rules.remind<Mapping | undefined>(Memory.LastMove)
  return !!lastMove?.some(([, to]) => sameCell(to, { x: item.location.x!, y: item.location.y! }))
}

/** The card just flipped, whose power is being applied. */
const isPlayedCard = (item: MaterialItem<number, LocationType>, context: Context) =>
  context.rules.game.rule?.id === RuleId.ApplyPower && sameCell(context.rules.remind(Memory.PlayedCell), { x: item.location.x!, y: item.location.y! })

export const gridCardCss = (item: MaterialItem<number, LocationType>, context: Context) =>
  item.location.type === LocationType.Grid && [isMovedLastTurn(item, context) && lastMoveCss, isPlayedCard(item, context) && playedCss]

const lastMoveCss = css`
  > * {
    outline: 0.15em dashed rgba(255, 255, 255, 0.8);
    outline-offset: 0.1em;
  }
`

const playedCss = css`
  > * {
    box-shadow: 0 0 0.4em 0.25em gold;
  }
`
