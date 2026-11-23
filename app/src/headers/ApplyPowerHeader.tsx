import { usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { ElementisRules } from '@gamepark/elementis/ElementisRules'
import { useTranslation } from 'react-i18next'

export const ApplyPowerHeader = () => {
  const { t } = useTranslation()
  const rules = useRules<ElementisRules>()!
  const me = usePlayerId<number>()
  const active = rules.getActivePlayer()
  const name = usePlayerName(active)
  return <>{active === me ? t('header.power.you') : t('header.power.player', { player: name })}</>
}
