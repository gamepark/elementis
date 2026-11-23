import { css } from '@emotion/react'
import { sameCell } from '@gamepark/elementis/material/Grid'
import { LocationType } from '@gamepark/elementis/material/LocationType'
import { MaterialType } from '@gamepark/elementis/material/MaterialType'
import { Mapping } from '@gamepark/elementis/rules/GridMove'
import { Memory } from '@gamepark/elementis/rules/Memory'
import { RuleId } from '@gamepark/elementis/rules/RuleId'
import { ItemContext, MaterialContext } from '@gamepark/react-game'
import { isMoveItem, MaterialItem, MaterialMove } from '@gamepark/rules-api'

type Context = ItemContext<number, MaterialType, LocationType>
type AnyContext = MaterialContext<number, MaterialType, LocationType>

/** The legal moves of the player who looks at the table, computed once per state of the game (the state can change in place). */
let movesCache: { key: string; moves: MaterialMove<number, MaterialType, LocationType>[] } | undefined
const myMoves = (context: AnyContext) => {
  const { items, rule, memory } = context.rules.game
  const key = JSON.stringify([context.player, items, rule, memory])
  if (movesCache?.key !== key) {
    const moves = context.player !== undefined && context.rules.isTurnToPlay(context.player) ? context.rules.getLegalMoves(context.player) : []
    movesCache = { key, moves }
  }
  return movesCache.moves
}

/** A card the player can play: flip it, or move it to apply the power of the card just flipped. */
export const canPlay = (context: Context) =>
  myMoves(context).some((move) => isMoveItem(move) && move.itemType === context.type && move.itemIndex === context.index)

/** P-7: the entries outside the grid where the played card can go back in, for the player who looks at the table. */
export const pushEntries = (context: AnyContext) =>
  myMoves(context).flatMap((move) => (isMoveItem(move) && move.location.type === LocationType.GridEntry ? [move.location] : []))

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
