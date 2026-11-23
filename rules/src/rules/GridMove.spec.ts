import { describe, expect, it } from 'vitest'
import { Element } from '../material/Element'
import { Cell, gridCells, isInside, sameCell } from '../material/Grid'
import { Power } from '../material/Power'
import { Board, candidateMoves, getMapping, GridMove, isInverse, legalMoves } from './GridMove'

/** Cells are numbered as in the BGA tests: n = row × 5 + column. */
const c = (n: number): Cell => ({ x: n % 5, y: Math.floor(n / 5) })
const n = (cell: Cell) => cell.y * 5 + cell.x
const CENTER = c(12)
const pairs = (moves: GridMove[]) => moves.map((move) => ('swap' in move ? move.swap.map(n).sort((a, b) => a - b) : []))

describe('Candidate moves of the powers', () => {
  it.each([
    ['P-1 inside ↔ inside', Power.InsideSwap, 12, 36],
    ['P-2 outside ↔ outside', Power.OutsideSwap, 12, 120],
    ['P-3 outside ↔ inside', Power.OutsideInsideSwap, 12, 144],
    ['P-4 column', Power.ColumnSwap, 7, 10],
    ['P-5 row', Power.RowSwap, 7, 10],
    ['P-7 push, center', Power.Push, 12, 4],
    ['P-7 push, edge', Power.Push, 2, 3],
    ['P-7 push, corner', Power.Push, 0, 2],
    ['P-8 diagonals, center', Power.DiagonalSwap, 12, 20],
    ['P-8 diagonals, corner', Power.DiagonalSwap, 0, 10],
    ['P-9 adjacent', Power.AdjacentSwap, 12, 40],
    ['P-10 one card between', Power.GapSwap, 12, 30],
    ['P-12 diagonally adjacent', Power.DiagonalAdjacentSwap, 12, 32],
    ['P-13 with the Elementis', Power.ElementisSwap, 0, 24],
    ['P-15 played ↔ neighbor, center', Power.PlayedAdjacentSwap, 12, 4],
    ['P-15 played ↔ neighbor, corner', Power.PlayedAdjacentSwap, 0, 2]
  ])('%s', (_, power, played, count) => {
    expect(candidateMoves(power, c(played), CENTER)).toHaveLength(count)
  })

  it('keep the inside and outside cells apart', () => {
    for (const [a, b] of pairs(candidateMoves(Power.InsideSwap, c(0)))) {
      expect(isInside(c(a)) && isInside(c(b))).toBe(true)
    }
    for (const [a, b] of pairs(candidateMoves(Power.OutsideInsideSwap, c(0)))) {
      expect(isInside(c(a)) !== isInside(c(b))).toBe(true)
    }
  })

  it('follow the row, column and diagonals of the played card', () => {
    expect(pairs(candidateMoves(Power.ColumnSwap, c(7)))).toContainEqual([2, 22])
    expect(pairs(candidateMoves(Power.RowSwap, c(7)))).toContainEqual([5, 9])
    expect(pairs(candidateMoves(Power.ColumnSwap, c(7)))).not.toContainEqual([5, 9])
    const diagonal = pairs(candidateMoves(Power.DiagonalSwap, c(7)))
    expect(diagonal).toContainEqual([1, 19])
    expect(diagonal).toContainEqual([3, 15])
    expect(diagonal).not.toContainEqual([1, 3])
  })

  it('never wrap around the grid', () => {
    expect(pairs(candidateMoves(Power.AdjacentSwap, c(0)))).not.toContainEqual([4, 5])
    expect(pairs(candidateMoves(Power.GapSwap, c(0)))).toContainEqual([0, 2])
    expect(pairs(candidateMoves(Power.GapSwap, c(0)))).not.toContainEqual([3, 5])
    expect(pairs(candidateMoves(Power.DiagonalAdjacentSwap, c(0)))).toContainEqual([4, 8])
    expect(pairs(candidateMoves(Power.DiagonalAdjacentSwap, c(0)))).not.toContainEqual([4, 10])
  })

  it('always involve the Elementis card for P-13', () => {
    for (const pair of pairs(candidateMoves(Power.ElementisSwap, c(0), CENTER))) expect(pair).toContain(12)
  })

  it('push the played card back in at the 4 ends of its row and column', () => {
    const ends = candidateMoves(Power.Push, CENTER).map((move) => ('push' in move ? n(move.push.to) : -1))
    expect(ends.sort((a, b) => a - b)).toEqual([2, 10, 14, 22])
  })
})

describe('A push', () => {
  it('slides the cards between the edge and the hole one cell towards the hole', () => {
    // The played card in 12 goes back in from the left: the cards in 10 and 11 slide to the right
    const mapping = getMapping({ push: { from: c(12), to: c(10) } }).map(([from, to]) => [n(from), n(to)])
    expect(mapping.sort((a, b) => a[0] - b[0])).toEqual([
      [10, 11],
      [11, 12],
      [12, 10]
    ])
  })
})

describe('The inverse of the previous move [R-5b]', () => {
  const swap = (a: number, b: number): GridMove => ({ swap: [c(a), c(b)] })
  const push = (from: number, to: number): GridMove => ({ push: { from: c(from), to: c(to) } })

  it('puts each moved card back in its place, whatever the power (F13)', () => {
    expect(isInverse(swap(4, 9), getMapping(swap(9, 4)))).toBe(true)
    expect(isInverse(push(10, 14), getMapping(push(14, 10)))).toBe(true)
    expect(isInverse(swap(10, 11), getMapping(push(11, 10)))).toBe(true)
    expect(isInverse(push(14, 10), getMapping(push(14, 10)))).toBe(false)
    expect(isInverse(push(12, 10), getMapping(push(12, 14)))).toBe(false)
  })
})

describe('Legal moves', () => {
  /** A board from a picture: * Elementis, . hidden, W F E A revealed elements, ? revealed with unknown element. */
  const board = (picture: string): Board => {
    const cells = picture.trim().split(/\s+/)
    const elementOf: Record<string, Element> = { W: Element.Water, F: Element.Fire, E: Element.Earth, A: Element.Air }
    return (cell) => {
      const symbol = cells[n(cell)]
      if (symbol === '*') return { kind: 'elementis' }
      if (symbol === '.') return { kind: 'hidden' }
      return { kind: 'revealed', element: elementOf[symbol] }
    }
  }

  it('always move a card on its element side or the Elementis card [R-5a]', () => {
    const b = board('. . . . .  . . . . .  . . * . .  . . . . .  . . . . .')
    const moves = legalMoves(b, Power.AdjacentSwap, c(0))
    expect(moves.length).toBe(4)
    for (const move of moves) expect('swap' in move && move.swap.some((cell) => sameCell(cell, CENTER))).toBe(true)
  })

  it('never swap 2 cards of the same element [R-5c]', () => {
    const b = board('W W . . .  . . . . .  . . * . .  . . . . .  . . . . .')
    expect(pairs(legalMoves(b, Power.AdjacentSwap, c(0)))).not.toContainEqual([0, 1])
  })

  it('allow a swap with a card whose element is not known yet', () => {
    const b = board('W ? . . .  . . . . .  . . * . .  . . . . .  . . . . .')
    expect(pairs(legalMoves(b, Power.AdjacentSwap, c(1)))).toContainEqual([0, 1])
  })

  it('do not apply the same element rule to the push (F12)', () => {
    const b = board('. W W . .  . . . . .  . . * . .  . . . . .  . . . . .')
    expect(legalMoves(b, Power.Push, c(2)).length).toBeGreaterThan(0)
  })

  it('never undo the previous move', () => {
    const b = board('W F . . .  . . . . .  . . * . .  . . . . .  . . . . .')
    const previous = getMapping({ swap: [c(0), c(1)] })
    expect(pairs(legalMoves(b, Power.AdjacentSwap, c(1), previous))).not.toContainEqual([0, 1])
    expect(pairs(legalMoves(b, Power.AdjacentSwap, c(1)))).toContainEqual([0, 1])
  })

  it('cover the whole grid', () => {
    expect(gridCells).toHaveLength(25)
  })
})
