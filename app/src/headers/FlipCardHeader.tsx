import { ElementisRules } from '@gamepark/elementis/ElementisRules'
import { GridState } from '@gamepark/elementis/rules/GridState'
import { usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { useTranslation } from 'react-i18next'

export const FlipCardHeader = () => {
  const { t } = useTranslation()
  const rules = useRules<ElementisRules>()!
  const me = usePlayerId<number>()
  const active = rules.getActivePlayer()
  const name = usePlayerName(active)
  if (active !== me) return <>{t('header.flip.player', { player: name })}</>
  /** [C-1] No card can be played: any card next to an Element card or the Elementis card is flipped without effect. */
  const noEffect = new GridState(rules.game).playableCells.length === 0
  return <>{t(noEffect ? 'header.flip.you.no-effect' : 'header.flip.you')}</>
}
