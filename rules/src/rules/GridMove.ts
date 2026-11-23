import { Element } from '../material/Element'
import { Cell, columnCells, diagonals, GRID_SIZE, gridCells, isInGrid, isInside, isOutside, orthogonalNeighbors, rowCells, sameCell } from '../material/Grid'
import { Power } from '../material/Power'

/**
 * What can be seen in a cell of the grid. A card still on its power side never has an element here: the legal moves are computed
 * from public information only, so they never betray a hidden element (F7, F27).
 */
export type Slot = { kind: 'elementis' } | { kind: 'hidden' } | { kind: 'revealed'; element?: Element }

/** The visible content of each cell. A revealed card without element: the card about to be flipped, whose element is not known yet. */
export type Board = (cell: Cell) => Slot

/** A move produced by a power: a swap of 2 cards, or the push of the played card back in from the edge (P-7). */
export type GridMove = { swap: [Cell, Cell] } | { push: { from: Cell; to: Cell } }

/** Where each card that moves goes: [from, to]. */
export type Mapping = [Cell, Cell][]

/** A card on its element side or the Elementis card: a starting point to flip a card [R-4.1], and what a power must move [R-5a]. */
export const isAnchor = (slot: Slot) => slot.kind !== 'hidden'

/** The cells crossed by a push, from the edge where the card comes in to the hole it left. */
export const pushPath = ({ from, to }: { from: Cell; to: Cell }): Cell[] => {
  const dx = Math.sign(from.x - to.x)
  const dy = Math.sign(from.y - to.y)
  const path = [to]
  for (let cell = to; !sameCell(cell, from); ) {
    cell = { x: cell.x + dx, y: cell.y + dy }
    path.push(cell)
  }
  return path
}

export const affectedCells = (move: GridMove): Cell[] => ('swap' in move ? move.swap : pushPath(move.push))

export const getMapping = (move: GridMove): Mapping => {
  if ('swap' in move) {
    const [a, b] = move.swap
    return [
      [a, b],
      [b, a]
    ]
  }
  const path = pushPath(move.push)
  return [[move.push.from, move.push.to], ...path.slice(0, -1).map((cell, i): [Cell, Cell] => [cell, path[i + 1]])]
}

/**
 * [R-5b] / F13: a move is the inverse of the previous one when it puts each card moved by it back in its place, and moves nothing
 * else. It works across powers: pushing 2 neighbor cards is the inverse of swapping them.
 */
export const isInverse = (move: GridMove, previous: Mapping): boolean => {
  const mapping = getMapping(move)
  return mapping.length === previous.length && previous.every(([from, to]) => mapping.some(([a, b]) => sameCell(a, to) && sameCell(b, from)))
}

const pairsWithin = (cells: Cell[]): [Cell, Cell][] => cells.flatMap((a, i) => cells.slice(i + 1).map((b): [Cell, Cell] => [a, b]))

const pairsBetween = (first: Cell[], second: Cell[]): [Cell, Cell][] =>
  first.flatMap((a) => second.filter((b) => !sameCell(a, b)).map((b): [Cell, Cell] => [a, b]))

/** All the pairs of cells separated by one of these offsets (the opposite offset is implied). */
const pairsAtOffsets = (offsets: Cell[]): [Cell, Cell][] =>
  gridCells.flatMap((a) => offsets.map(({ x, y }) => ({ x: a.x + x, y: a.y + y })).filter(isInGrid).map((b): [Cell, Cell] => [a, b]))

/** The pairs of cells that a swap power can exchange, before the common rules [R-5a/b/c]. */
const swapPairs = (power: Power, played: Cell, elementis?: Cell): [Cell, Cell][] => {
  switch (power) {
    case Power.InsideSwap:
      return pairsWithin(gridCells.filter(isInside))
    case Power.OutsideSwap:
      return pairsWithin(gridCells.filter(isOutside))
    case Power.OutsideInsideSwap:
      return pairsBetween(gridCells.filter(isOutside), gridCells.filter(isInside))
    case Power.ColumnSwap:
      return pairsWithin(columnCells(played))
    case Power.RowSwap:
      return pairsWithin(rowCells(played))
    case Power.DiagonalSwap:
      return diagonals(played).flatMap(pairsWithin)
    case Power.AdjacentSwap:
      return pairsAtOffsets([
        { x: 1, y: 0 },
        { x: 0, y: 1 }
      ])
    case Power.GapSwap:
      return pairsAtOffsets([
        { x: 2, y: 0 },
        { x: 0, y: 2 }
      ])
    case Power.DiagonalAdjacentSwap:
      return pairsAtOffsets([
        { x: 1, y: 1 },
        { x: -1, y: 1 }
      ])
    case Power.ElementisSwap:
      return elementis ? pairsBetween([elementis], gridCells) : []
    case Power.PlayedAdjacentSwap:
      return pairsBetween([played], orthogonalNeighbors(played))
    default:
      return []
  }
}

/**
 * P-7: the played card goes back in at one of the 4 ends of its row or column. An end where it already is, is left out: nothing
 * would move (F10).
 */
const pushMoves = (played: Cell): GridMove[] => {
  const last = GRID_SIZE - 1
  const ends = [
    { x: 0, y: played.y },
    { x: last, y: played.y },
    { x: played.x, y: 0 },
    { x: played.x, y: last }
  ]
  return ends
    .filter((to, i) => !sameCell(to, played) && ends.findIndex((other) => sameCell(other, to)) === i)
    .map((to) => ({ push: { from: played, to } }))
}

/** The moves a power proposes from its pattern, before the common rules. */
export const candidateMoves = (power: Power, played: Cell, elementis?: Cell): GridMove[] =>
  power === Power.Push ? pushMoves(played) : swapPairs(power, played, elementis).map((swap) => ({ swap }))

/** [R-5c]: never swap 2 cards of the same element. Only visible elements count (F27); it does not apply to the push (F12). */
const swapsSameElement = (move: GridMove, board: Board) => {
  if (!('swap' in move)) return false
  const [a, b] = move.swap.map(board)
  return a.kind === 'revealed' && b.kind === 'revealed' && a.element !== undefined && a.element === b.element
}

/**
 * The legal moves of a power, after the common rules:
 * - [R-5a] at least one moved card is on its element side, or is the Elementis card;
 * - [R-5c] never a swap of 2 cards of the same element;
 * - [R-5b] never the exact inverse of the move of the previous turn.
 */
export const legalMoves = (board: Board, power: Power, played: Cell, previous?: Mapping): GridMove[] => {
  const elementis = gridCells.find((cell) => board(cell).kind === 'elementis')
  return candidateMoves(power, played, elementis).filter(
    (move) => affectedCells(move).some((cell) => isAnchor(board(cell))) && !swapsSameElement(move, board) && !(previous && isInverse(move, previous))
  )
}
