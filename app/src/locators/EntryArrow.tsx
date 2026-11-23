import { css } from '@emotion/react'
import { GRID_SIZE } from '@gamepark/elementis/material/Grid'
import { Location } from '@gamepark/rules-api'

/** P-7: an arrow pointing into the grid, where the played card can go back in. */
export const EntryArrow = ({ location }: { location: Location }) => {
  const rotation = location.x! < 0 ? 0 : location.x! >= GRID_SIZE ? 180 : location.y! < 0 ? 90 : -90
  return (
    <svg viewBox="0 0 10 10" css={arrowCss} style={{ transform: `rotate(${rotation}deg)` }}>
      <path d="M1 3.5 H5.5 V1 L9.5 5 L5.5 9 V6.5 H1 Z" />
    </svg>
  )
}

const arrowCss = css`
  width: 100%;
  height: 100%;
  fill: gold;
  stroke: black;
  stroke-width: 0.3;
  filter: drop-shadow(0 0 0.2em black);
`
