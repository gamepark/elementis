import { ElementisRules } from '@gamepark/elementis/ElementisRules'
import { Power } from '@gamepark/elementis/material/Power'
import { Memory } from '@gamepark/elementis/rules/Memory'
import { usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { useTranslation } from 'react-i18next'

export const ApplyPowerHeader = () => {
  const { t } = useTranslation()
  const rules = useRules<ElementisRules>()!
  const me = usePlayerId<number>()
  const active = rules.getActivePlayer()
  const name = usePlayerName(active)
  const power = rules.remind<Power>(Memory.PlayedPower)
  if (active !== me) return <>{t('header.power.player', { player: name, power: t(`power.${power}`) })}</>
  return <>{t(power === Power.Push ? 'header.power.you.push' : 'header.power.you', { power: t(`power.${power}`) })}</>
}
