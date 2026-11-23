import { LocationType } from '@gamepark/elementis/material/LocationType'
import { MaterialType } from '@gamepark/elementis/material/MaterialType'
import { MaterialHelpProps } from '@gamepark/react-game'
import { useTranslation } from 'react-i18next'
import { PowerRules } from './PowerRules'

/** A Help card: one of the 6 powers of the game, with the rules common to all the powers and the reminder to play without talking. */
export const HelpCardHelp = ({ item }: MaterialHelpProps<number, MaterialType, LocationType>) => {
  const { t } = useTranslation()
  return (
    <>
      <h2>{t('help.help-card.title')}</h2>
      <p>{t('help.power', { power: t(`power.${item.id}`) })}</p>
      <p>{t('help.help-card.cards')}</p>
      <PowerRules />
      <p>
        <em>{t('help.silence')}</em>
      </p>
    </>
  )
}
