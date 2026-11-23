import { ElementisRules } from '@gamepark/elementis/ElementisRules'
import { Element } from '@gamepark/elementis/material/Element'
import { GridState } from '@gamepark/elementis/rules/GridState'
import { ScoringDescription } from '@gamepark/react-game'
import { Trans } from 'react-i18next'
import { ElementisResultHeader } from './ElementisResultHeader'

enum ScoringKey {
  Water = Element.Water,
  Fire = Element.Fire,
  Earth = Element.Earth,
  Air = Element.Air,
  Total
}

/**
 * The end of game table [R-8]: for each element, the size of its largest zone, then the total out of 24. The players share the same
 * score: it is a cooperative game.
 */
export class ElementisScoring implements ScoringDescription<number, ElementisRules, ScoringKey> {
  ResultHeader = ElementisResultHeader

  getScoringKeys() {
    return [ScoringKey.Water, ScoringKey.Fire, ScoringKey.Earth, ScoringKey.Air, ScoringKey.Total]
  }

  getScoringHeader(key: ScoringKey) {
    if (key === ScoringKey.Total) {
      return (
        <strong>
          <Trans i18nKey="scoring.total" />
        </strong>
      )
    }
    return <Trans i18nKey={`scoring.zone.${key}`} />
  }

  getScoringPlayerData(key: ScoringKey, _player: number, rules: ElementisRules) {
    const state = new GridState(rules.game)
    if (key === ScoringKey.Total) return <strong>{state.score}</strong>
    return state.largestZone(key as number as Element).length
  }
}
