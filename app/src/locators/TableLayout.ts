import { GRID_SIZE } from '@gamepark/elementis/material/Grid'

/**
 * The whole table, in centimetres, at the scale of the real square cards.
 * The 5 × 5 grid in the middle, the Help cards of the 6 powers of the game on its left, in 2 columns of 3.
 */
export const cardSize = 6
export const cardBorderRadius = 0.4
export const cardGap = 0.2
export const cardPitch = cardSize + cardGap

export const gridWidth = GRID_SIZE * cardPitch - cardGap

/** The center of a cell of the grid, the grid being centered on the table. */
export const gridCellCoordinates = (x: number, y: number) => ({
  x: (x - (GRID_SIZE - 1) / 2) * cardPitch,
  y: (y - (GRID_SIZE - 1) / 2) * cardPitch
})

export const helpCardSize = 5
const helpCardPitch = helpCardSize + 0.4
const helpLeft = -gridWidth / 2 - 2 - 2 * helpCardPitch + helpCardSize / 2

/** The Help cards: 2 columns of 3, left of the grid. */
export const helpCardCoordinates = (x: number) => ({
  x: helpLeft + (x % 2) * helpCardPitch,
  y: (Math.floor(x / 2) - 1) * helpCardPitch
})

export const tableBounds = {
  xMin: helpLeft - helpCardSize / 2 - 1,
  xMax: gridWidth / 2 + 1,
  yMin: -gridWidth / 2 - 1,
  yMax: gridWidth / 2 + 1
}
