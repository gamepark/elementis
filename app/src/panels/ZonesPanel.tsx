import { css } from '@emotion/react'
import { ElementisRules } from '@gamepark/elementis/ElementisRules'
import { Element, elements } from '@gamepark/elementis/material/Element'
import { GridState, WIN_THRESHOLD } from '@gamepark/elementis/rules/GridState'
import { Memory } from '@gamepark/elementis/rules/Memory'
import { useRules } from '@gamepark/react-game'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

const elementColors: Record<Element, string> = {
  [Element.Water]: '#3a6fd8',
  [Element.Fire]: '#e8336a',
  [Element.Earth]: '#5fae4a',
  [Element.Air]: '#f2b51d'
}

/**
 * The score help [R-8]: the size of the largest zone of each element, and the total out of 24, to reach 22 to win (F8).
 * Hidden in expert mode, where the score is only revealed at the end of the game.
 */
export const ZonesPanel = () => {
  const { t } = useTranslation()
  const rules = useRules<ElementisRules>()
  const root = document.getElementById('root')
  if (!rules || !root || rules.remind(Memory.Expert)) return null
  const state = new GridState(rules.game)
  const zones = elements.map((element) => ({ element, size: state.largestZone(element).length }))
  const total = zones.reduce((sum, zone) => sum + zone.size, 0)
  return createPortal(
    <div css={[panelCss, panelPosition(rules.players.length)]}>
      <div css={titleCss}>{t('zones.title')}</div>
      {zones.map(({ element, size }) => (
        <div key={element} css={lineCss}>
          <span css={dotCss(elementColors[element])} />
          <span>{t(`element.${element}`)}</span>
          <span css={sizeCss}>{size}</span>
        </div>
      ))}
      <div css={[lineCss, totalCss]}>
        <span>{t('zones.total')}</span>
        <span css={sizeCss}>{t('zones.total.value', { total })}</span>
      </div>
      <div css={goalCss}>{t('zones.goal', { threshold: WIN_THRESHOLD })}</div>
    </div>,
    root
  )
}

const panelCss = css`
  position: absolute;
  right: 1em;
  width: 28em;
  padding: 1em 1.5em;
  border-radius: 1em;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 1em;
`

const panelPosition = (players: number) => css`
  top: ${8.5 + players * 16}em;
`

const titleCss = css`
  font-weight: bold;
  font-size: 2.4em;
  margin-bottom: 0.3em;
`

const lineCss = css`
  display: flex;
  align-items: center;
  gap: 0.6em;
  font-size: 2.4em;
  line-height: 1.5;
`

const dotCss = (color: string) => css`
  width: 0.8em;
  height: 0.8em;
  border-radius: 50%;
  background: ${color};
`

const sizeCss = css`
  margin-left: auto;
  font-weight: bold;
`

const goalCss = css`
  font-size: 2em;
  font-style: italic;
  opacity: 0.8;
`

const totalCss = css`
  border-top: 0.05em solid rgba(255, 255, 255, 0.5);
  margin-top: 0.2em;
`
