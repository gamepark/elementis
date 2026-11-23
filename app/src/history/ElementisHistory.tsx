import { LocationType } from '@gamepark/elementis/material/LocationType'
import { MaterialType } from '@gamepark/elementis/material/MaterialType'
import { Power } from '@gamepark/elementis/material/Power'
import { Memory } from '@gamepark/elementis/rules/Memory'
import { RuleId } from '@gamepark/elementis/rules/RuleId'
import { LogDescription, MoveComponentContext, MovePlayedLogDescription } from '@gamepark/react-game'
import { isMoveItem, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { FlipLog, PushLog, SwapLog } from './ElementisLogs'

type Game = MaterialGame<number, MaterialType, LocationType, RuleId>
type Move = MaterialMove<number, MaterialType, LocationType, RuleId>
type Context = MoveComponentContext<Move, number, Game>

/**
 * What the journal writes down: each card flipped, with its element (and when its power has no effect), each swap and each push.
 * The moves that follow from them (the other card of a swap, the played card leaving the grid, the cards sliding) say nothing more.
 */
export class ElementisHistory implements LogDescription<Move, number, Game> {
  getMovePlayedLogDescription(move: Move, context: Context): MovePlayedLogDescription | undefined {
    const game = context.game
    const player = game.rule?.player
    if (!isMoveItem(move)) return undefined
    switch (game.rule?.id) {
      case RuleId.FlipCard:
        return move.location.rotation ? { Component: FlipLog, player } : undefined
      case RuleId.ApplyPower:
        if (move.location.type === LocationType.GridEntry) return { Component: PushLog, player }
        // During a push, the cards sliding and the played card coming in follow from the arrow chosen
        if (game.memory[Memory.PlayedPower] === Power.Push) return undefined
        // The first card of a swap: the other card then takes its place
        if (move.location.type === LocationType.Grid && !game.memory[Memory.MoveOrigin]) return { Component: SwapLog, player }
        return undefined
    }
    return undefined
  }
}
