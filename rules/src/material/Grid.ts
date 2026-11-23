/** The grid is 5 × 5 cards [R-3]. A cell is { x: column, y: row }, (0, 0) at the top left. */
export const GRID_SIZE = 5

export type Cell = { x: number; y: number }

export const gridCells: Cell[] = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => ({ x: i % GRID_SIZE, y: Math.floor(i / GRID_SIZE) }))

export const isInGrid = ({ x, y }: Cell) => x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE

export const sameCell = (a: Cell, b: Cell) => a.x === b.x && a.y === b.y

/** The 16 cells on the edge of the grid. */
export const isOutside = ({ x, y }: Cell) => x === 0 || y === 0 || x === GRID_SIZE - 1 || y === GRID_SIZE - 1

/** The 9 inside cells, central cell included. */
export const isInside = (cell: Cell) => !isOutside(cell)

/** The cells that touch this one by a side, not diagonally [R-4.1]. */
export const orthogonalNeighbors = ({ x, y }: Cell): Cell[] =>
  [
    { x, y: y - 1 },
    { x, y: y + 1 },
    { x: x - 1, y },
    { x: x + 1, y }
  ].filter(isInGrid)

export const rowCells = ({ y }: Cell): Cell[] => Array.from({ length: GRID_SIZE }, (_, x) => ({ x, y }))

export const columnCells = ({ x }: Cell): Cell[] => Array.from({ length: GRID_SIZE }, (_, y) => ({ x, y }))

/** The 2 diagonals going through a cell, each including the cell itself. */
export const diagonals = (cell: Cell): Cell[][] =>
  [1, -1].map((dx) => gridCells.filter((other) => other.y - cell.y === (other.x - cell.x) * dx))

/** P-7: the entry just outside the grid from which a card goes in at an end cell, coming along a row or a column. */
export const entryOf = ({ from, to }: { from: Cell; to: Cell }): Cell => {
  if (from.y === to.y) return { x: to.x === 0 ? -1 : GRID_SIZE, y: to.y }
  return { x: to.x, y: to.y === 0 ? -1 : GRID_SIZE }
}

/** P-7: the end cell where a card coming in from an entry arrives. */
export const entryCell = ({ x, y }: Cell): Cell => ({ x: Math.min(Math.max(x, 0), GRID_SIZE - 1), y: Math.min(Math.max(y, 0), GRID_SIZE - 1) })
