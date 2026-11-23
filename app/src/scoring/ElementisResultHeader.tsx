import { ElementisRules } from '@gamepark/elementis/ElementisRules'
import { GridState, WIN_THRESHOLD } from '@gamepark/elementis/rules/GridState'
import { useRules } from '@gamepark/react-game'
import { useTranslation } from 'react-i18next'

/** A cooperative game: the players win together from 22 points out of 24 (F8), or lose together. */
export const ElementisResultHeader = () => {
  const { t } = useTranslation()
  const rules = useRules<ElementisRules>()
  if (!rules) return null
  const score = new GridState(rules.game).score
  const values = { score, threshold: WIN_THRESHOLD }
  return <>{t(score >= WIN_THRESHOLD ? 'result.won' : 'result.lost', values)}</>
}
