import { HiddenMaterialRules, MaterialGame, MaterialItem, MaterialMove, TimeLimit } from '@gamepark/rules-api'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { ApplyPowerRule } from './rules/ApplyPowerRule'
import { FlipCardRule } from './rules/FlipCardRule'
import { GridState, WIN_THRESHOLD } from './rules/GridState'
import { RuleId } from './rules/RuleId'

/** The element of a card still on its power side is hidden from everyone (the power side is the same for the 4 elements, F25). */
const hideElementOfPowerSide = (item: MaterialItem<number, LocationType>) => (item.location.rotation ? [] : ['id.front'])

/**
 * This class implements the rules of the board game.
 * It must follow Game Park "Rules" API so that the Game Park server can enforce the rules.
 */
export class ElementisRules
  extends HiddenMaterialRules<number, MaterialType, LocationType, RuleId>
  implements TimeLimit<MaterialGame<number, MaterialType, LocationType, RuleId>, MaterialMove<number, MaterialType, LocationType, RuleId>, number>
{
  rules = {
    [RuleId.FlipCard]: FlipCardRule,
    [RuleId.ApplyPower]: ApplyPowerRule
  }

  locationsStrategies = {}

  hidingStrategies = {
    [MaterialType.ElementCard]: {
      [LocationType.Grid]: hideElementOfPowerSide
    }
  }

  giveTime(): number {
    return 30
  }

  /**
   * A cooperative game: all the players share the same score [R-8]. As for the solo of Djeser, a lost game scores 0: the game is won
   * from 22 points out of 24 (F8). The end of game table shows the real score.
   */
  getScore(_player: number) {
    const score = new GridState(this.game).score
    return score >= WIN_THRESHOLD ? score : 0
  }
}
