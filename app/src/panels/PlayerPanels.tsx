import { css } from '@emotion/react'
import { StyledPlayerPanel, usePlayers } from '@gamepark/react-game'
import { createPortal } from 'react-dom'
import PanelBackground from '../images/panel-background.webp'

/** The panels of the players, on the art of the box. */
export const PlayerPanels = () => {
  const players = usePlayers<number>({ sortFromMe: true })
  const root = document.getElementById('root')
  if (!root) {
    return null
  }

  return createPortal(
    <>
      {players.map((player, index) => (
        <StyledPlayerPanel key={player.id} player={player} css={panelPosition(index)} activeRing backgroundImage={PanelBackground} />
      ))}
    </>,
    root
  )
}

const panelPosition = (index: number) => css`
  position: absolute;
  right: 1em;
  top: ${8.5 + index * 16}em;
  width: 28em;
`
