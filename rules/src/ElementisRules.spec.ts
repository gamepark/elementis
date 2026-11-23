import { applyAutomaticMoves, isMoveItemType, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { describe, expect, it } from 'vitest'
import { ElementisRules } from './ElementisRules'
import { ElementisSetup } from './ElementisSetup'
import { Element } from './material/Element'
import { Cell, gridCells, orthogonalNeighbors, sameCell } from './material/Grid'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { ElementCardId, GridState } from './rules/GridState'
import { Memory } from './rules/Memory'
import { RuleId } from './rules/RuleId'

type Game = MaterialGame<number, MaterialType, LocationType, RuleId>
type Move = MaterialMove<number, MaterialType, LocationType, RuleId>

const newGame = (players = 2): Game => new ElementisSetup().setup({ players })
const legalMoves = (game: Game) => {
  const rules = new ElementisRules(game)
  return rules.getLegalMoves(rules.getActivePlayer()!)
}
const play = (game: Game, move: Move) => applyAutomaticMoves(new ElementisRules(game), [move])

/**
 * Plays a move and its consequences one by one, computing the legal moves after each of them, as the display does while it
 * animates: the intermediate states must never break the rules.
 */
const playStepByStep = (game: Game, move: Move) => {
  const queue = [move]
  while (queue.length) {
    const rules = new ElementisRules(game)
    queue.unshift(...rules.play(queue.shift()!))
    const player = new ElementisRules(game).getActivePlayer()
    if (player !== undefined) new ElementisRules(game).getLegalMoves(player)
  }
}
const cellOf = (game: Game, type: MaterialType, index: number): Cell => {
  const { x, y } = game.items[type]![index].location
  return { x: x!, y: y! }
}
const gridKeys = (game: Game) =>
  [MaterialType.ElementCard, MaterialType.ElementisCard].flatMap((type) => game.items[type]!.filter((item) => item.location.type === LocationType.Grid).map((item) => `${item.location.x},${item.location.y}`))

/** Plays random legal moves until the end of the game, checking the grid after each move. */
const playRandomGame = (game: Game) => {
  let turns = 0
  while (game.rule?.id !== undefined) {
    const moves = legalMoves(game)
    expect(moves.length).toBeGreaterThan(0)
    playStepByStep(game, moves[Math.floor(Math.random() * moves.length)])
    // Between 2 turns, the grid is full; while a push is applied, the played card waits beside the board
    const pushing = game.rule?.id === RuleId.ApplyPower && game.items[MaterialType.ElementCard]!.some((item) => item.location.type === LocationType.PushedCard)
    expect(new Set(gridKeys(game)).size).toBe(pushing ? 24 : 25)
    if (game.rule?.id === RuleId.FlipCard) turns++
    expect(turns).toBeLessThanOrEqual(24)
  }
  return game
}

describe('Setup [R-3]', () => {
  it('lays 24 Element cards of 6 powers and the Elementis card in a 5 × 5 grid, power side up', () => {
    const game = newGame()
    const cards = game.items[MaterialType.ElementCard]!.map((item) => item.id as ElementCardId)
    const powers = new Set(cards.map((id) => id.back))
    expect(cards).toHaveLength(24)
    expect(powers.size).toBe(6)
    for (const element of [Element.Water, Element.Fire, Element.Earth, Element.Air]) {
      expect(cards.filter((id) => id.front === element)).toHaveLength(6)
    }
    expect(game.items[MaterialType.ElementisCard]).toHaveLength(1)
    expect(new Set(gridKeys(game)).size).toBe(25)
    expect(game.items[MaterialType.ElementCard]!.every((item) => !item.location.rotation)).toBe(true)
    expect(game.items[MaterialType.HelpCard]!.map((item) => item.id).sort()).toEqual([...powers].sort())
  })

  it('hides the element of the cards still on their power side from everyone', () => {
    const view = new ElementisRules(newGame()).getView()
    expect(view.items[MaterialType.ElementCard]!.every((item) => (item.id as ElementCardId).front === undefined)).toBe(true)
    expect(view.items[MaterialType.ElementCard]!.every((item) => (item.id as ElementCardId).back !== undefined)).toBe(true)
  })
})

describe('Options', () => {
  it('remembers the expert mode, to hide the score help during the game', () => {
    expect(new ElementisSetup().setup({ players: 1, expert: true }).memory[Memory.Expert]).toBe(true)
    expect(newGame().memory[Memory.Expert]).toBeUndefined()
  })
})

describe('A turn', { timeout: 60_000 }, () => {
  it('starts next to the Elementis card [R-4.1]', () => {
    const game = newGame()
    const elementis = cellOf(game, MaterialType.ElementisCard, 0)
    for (const move of legalMoves(game)) {
      expect(isMoveItemType(MaterialType.ElementCard)(move)).toBe(true)
      if (!isMoveItemType(MaterialType.ElementCard)(move)) continue
      expect(orthogonalNeighbors(elementis).some((cell) => sameCell(cell, cellOf(game, MaterialType.ElementCard, move.itemIndex)))).toBe(true)
    }
  })

  it('flips the card, then applies its power and passes to the other player', () => {
    const game = newGame()
    const first = game.rule!.player
    const flip = legalMoves(game)[0]
    play(game, flip)
    if (game.rule?.id === RuleId.ApplyPower) {
      play(game, legalMoves(game)[0])
      expect(new GridState(game).lastMove).toBeDefined()
    }
    expect(game.rule?.id).toBe(RuleId.FlipCard)
    expect(game.rule?.player).not.toBe(first)
    expect(new GridState(game).hiddenCards).toHaveLength(23)
  })

  it('never offers the inverse of the previous move [R-5b]', () => {
    for (let i = 0; i < 30; i++) {
      const game = newGame()
      while (game.rule?.id !== undefined) {
        if (game.rule.id === RuleId.ApplyPower) {
          const previous = new GridState(game).lastMove
          for (const move of legalMoves(game)) {
            const after = JSON.parse(JSON.stringify(game)) as Game
            play(after, move)
            const state = new GridState(after).lastMove!
            if (previous) {
              const undoes = state.length === previous.length && previous.every(([from, to]) => state.some(([a, b]) => sameCell(a, to) && sameCell(b, from)))
              expect(undoes).toBe(false)
            }
            expect(new Set(gridKeys(after)).size).toBe(25)
          }
        }
        const moves = legalMoves(game)
        play(game, moves[Math.floor(Math.random() * moves.length)])
      }
    }
  })
})

describe('A push (P-7)', () => {
  it('removes the played card, then inserts it back from an entry outside the grid, the cards sliding towards the hole', () => {
    const game = newGame(1)
    const cards = game.items[MaterialType.ElementCard]!
    const elementis = game.items[MaterialType.ElementisCard]![0]
    const at = (x: number, y: number) => [...cards, elementis].find((item) => item.location.x === x && item.location.y === y)!
    // A push card in (0, 2), the Elementis card on its right in (1, 2), the other cards anywhere else
    const pushCard = cards[0]
    ;(pushCard.id as ElementCardId).back = 7
    pushCard.location = { type: LocationType.Grid, x: 0, y: 2 }
    elementis.location = { type: LocationType.Grid, x: 1, y: 2 }
    const free = gridCells.filter((cell) => cell.y !== 2 || cell.x > 1)
    cards.slice(1).forEach((item, i) => (item.location = { type: LocationType.Grid, ...free[i] }))
    const index = cards.indexOf(pushCard)
    play(game, legalMoves(game).find((move) => isMoveItemType(MaterialType.ElementCard)(move) && move.itemIndex === index)!)
    expect(game.rule?.id).toBe(RuleId.ApplyPower)
    expect(cards[index].location.type).toBe(LocationType.PushedCard)
    const entries = legalMoves(game).map((move) => isMoveItemType(MaterialType.ElementCard)(move) && move.location)
    expect(entries).toContainEqual({ type: LocationType.GridEntry, x: 5, y: 2 })
    expect(entries).not.toContainEqual({ type: LocationType.GridEntry, x: -1, y: 2 })
    const row = [1, 2, 3, 4].map((x) => {
      const item = at(x, 2)
      return item === elementis ? ([MaterialType.ElementisCard, 0] as const) : ([MaterialType.ElementCard, cards.indexOf(item)] as const)
    })
    play(game, legalMoves(game).find((move) => isMoveItemType(MaterialType.ElementCard)(move) && move.location.x === 5 && move.location.y === 2)!)
    // It comes in at the right end of its row: the cards of the row slide to the left, into the hole
    expect(game.items[MaterialType.ElementCard]![index].location).toEqual({ type: LocationType.Grid, x: 4, y: 2, rotation: true })
    expect(row.map(([type, i]) => game.items[type]![i].location.x)).toEqual([0, 1, 2, 3])
    expect(new Set(gridKeys(game)).size).toBe(25)
    expect(game.rule?.id).toBe(RuleId.FlipCard)
  })
})

describe('Whole games', { timeout: 60_000 }, () => {
  it.each([1, 2])('end when all the cards are flipped, at %i players [R-6]', (players) => {
    for (let i = 0; i < 100; i++) {
      const game = playRandomGame(newGame(players))
      const state = new GridState(game)
      expect(state.hiddenCards).toHaveLength(0)
      expect(state.score).toBeGreaterThan(0)
      expect(state.score).toBeLessThanOrEqual(24)
      const rules = new ElementisRules(game)
      for (const player of game.players) expect(rules.getScore(player)).toBe(state.score >= 22 ? state.score : 0)
    }
  })
})
