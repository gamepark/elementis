import { GRID_SIZE } from '@gamepark/elementis/material/Grid'

/**
 * The whole table, in centimetres, at the scale of the real square cards.
 * The 5 × 5 grid in the middle, the Help cards of the 6 powers of the game on its left, in 2 columns of 3.
 * Around the grid, room for the arrows of a push (P-7); on its right, room for the played card waiting to be pushed back in.
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

/** P-7: the arrows just outside the grid, in front of the ends of the rows and columns. */
export const arrowSize = 2.6
const arrowGap = 0.4
const arrowBand = arrowGap + arrowSize

/** P-7: an entry is at x = -1 or 5 (left or right of row y), or y = -1 or 5 (above or below column x). */
export const gridEntryCoordinates = (x: number, y: number) => {
  const last = GRID_SIZE - 1
  const cell = gridCellCoordinates(Math.min(Math.max(x, 0), last), Math.min(Math.max(y, 0), last))
  const offset = cardSize / 2 + arrowGap + arrowSize / 2
  return {
    x: cell.x + (x < 0 ? -offset : x > last ? offset : 0),
    y: cell.y + (y < 0 ? -offset : y > last ? offset : 0)
  }
}

/** P-7: the played card waits on the right of the grid, beyond the arrows. */
export const pushedCardCoordinates = { x: gridWidth / 2 + arrowBand + 1 + cardSize / 2, y: 0 }

export const helpCardSize = cardSize
const helpCardPitch = helpCardSize + cardGap
const helpLeft = -gridWidth / 2 - arrowBand - 1.5 - 2 * helpCardPitch + helpCardSize / 2

/** The Help cards: 2 columns of 3, left of the grid. */
export const helpCardCoordinates = (x: number) => ({
  x: helpLeft + (x % 2) * helpCardPitch,
  y: (Math.floor(x / 2) - 1) * helpCardPitch
})

export const tableBounds = {
  xMin: helpLeft - helpCardSize / 2 - 1,
  xMax: pushedCardCoordinates.x + cardSize / 2 + 1,
  yMin: -gridWidth / 2 - arrowBand - 0.5,
  yMax: gridWidth / 2 + arrowBand + 0.5
}
