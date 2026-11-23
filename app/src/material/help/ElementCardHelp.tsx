import { ElementisRules } from '@gamepark/elementis/ElementisRules'
import { LocationType } from '@gamepark/elementis/material/LocationType'
import { MaterialType } from '@gamepark/elementis/material/MaterialType'
import { ElementCardId, GridState } from '@gamepark/elementis/rules/GridState'
import { Memory } from '@gamepark/elementis/rules/Memory'
import { MaterialHelpProps, useRules } from '@gamepark/react-game'
import { useTranslation } from 'react-i18next'
import { PowerRules } from './PowerRules'

/**
 * An Element card. On its power side, its element is hidden: the help gives its power and when it can be flipped. On its element
 * side, it also gives its element and the largest zone of this element, unless the score is hidden (expert mode).
 */
export const ElementCardHelp = ({ item }: MaterialHelpProps<number, MaterialType, LocationType>) => {
  const { t } = useTranslation()
  const rules = useRules<ElementisRules>()
  const id = item.id as ElementCardId | undefined
  const element = item.location?.rotation || item.location?.type === LocationType.PushedCard ? id?.front : undefined
  const expert = !!rules?.remind(Memory.Expert)
  const zone = rules && element ? new GridState(rules.game).largestZone(element).length : 0
  return (
    <>
      <h2>{element ? t('help.element.title', { element: t(`element.${element}`) }) : t('help.power-side.title')}</h2>
      {id?.back && <p>{t('help.power', { power: t(`power.${id.back}`) })}</p>}
      {element ? (
        <>
          <p>{t('help.element.zone')}</p>
          {!expert && <p>{t('help.element.largest', { element: t(`element.${element}`), count: zone })}</p>}
          <p>{t('help.element.swap')}</p>
        </>
      ) : (
        <>
          <p>{t('help.power-side.hidden')}</p>
          <p>{t('help.power-side.flip')}</p>
        </>
      )}
      <PowerRules />
    </>
  )
}
