import { MaterialRulesPart } from '@gamepark/rules-api'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { GridState } from './GridState'
import { RuleId } from './RuleId'

/** End of a turn: the game ends when all the cards are flipped [R-6], otherwise the other player plays. */
export const endTurn = (rule: MaterialRulesPart<number, MaterialType, LocationType, RuleId> & { nextPlayer: number }) =>
  new GridState(rule.game).hiddenCards.length ? [rule.startPlayerTurn(RuleId.FlipCard, rule.nextPlayer)] : [rule.endGame()]
