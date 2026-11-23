import { isMoveItem, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { ElementisRules } from '../ElementisRules'
import { Element, elements } from '../material/Element'
import { Cell, entryOf, GRID_SIZE, gridCells, orthogonalNeighbors, sameCell } from '../material/Grid'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { Power } from '../material/Power'
import { Board, getMapping, GridMove, legalMoves, Mapping, Slot } from '../rules/GridMove'
import { GridState } from '../rules/GridState'
import { Memory } from '../rules/Memory'
import { RuleId } from '../rules/RuleId'

type Game = MaterialGame<number, MaterialType, LocationType, RuleId>
type Move = MaterialMove<number, MaterialType, LocationType, RuleId>

/** Each element has 6 cards in the grid: 4 cards of each of the 6 powers of the game, one per element. */
const CARDS_PER_ELEMENT = 6

const key = ({ x, y }: Cell) => y * GRID_SIZE + x

/** A board the bot can change: the visible content of the 25 cells. */
const snapshot = (board: Board): Slot[] => gridCells.map(board)
const asBoard = (slots: Slot[]): Board => (cell) => slots[key(cell)]

const applyMapping = (slots: Slot[], mapping: Mapping): Slot[] => {
  const next = [...slots]
  for (const [from, to] of mapping) next[key(to)] = slots[key(from)]
  return next
}

/**
 * The value of a grid for the bot: first the score [R-8] (the largest zone of each element), then the pairs of orthogonally adjacent
 * cards of the same element, which prepare the next zones.
 */
export const evaluate = (slots: Slot[]): number => {
  let score = 0
  let pairs = 0
  for (const element of elements) {
    const isOf = (cell: Cell) => {
      const slot = slots[key(cell)]
      return slot.kind === 'revealed' && slot.element === element
    }
    const seen = new Set<number>()
    let largest = 0
    for (const start of gridCells) {
      if (seen.has(key(start)) || !isOf(start)) continue
      let size = 0
      const queue = [start]
      seen.add(key(start))
      while (queue.length) {
        const cell = queue.pop()!
        size++
        for (const neighbor of orthogonalNeighbors(cell)) {
          if (!isOf(neighbor)) continue
          if (key(neighbor) > key(cell)) pairs++
          if (!seen.has(key(neighbor))) {
            seen.add(key(neighbor))
            queue.push(neighbor)
          }
        }
      }
      largest = Math.max(largest, size)
    }
    score += largest
  }
  return score * 10 + pairs
}

/** The best move of a power on a board, and the value of the board after it. */
const bestPowerMove = (slots: Slot[], power: Power, played: Cell, lastMove?: Mapping): { move?: GridMove; value: number } => {
  let best: { move?: GridMove; value: number } = { value: evaluate(slots) }
  let found = false
  for (const move of legalMoves(asBoard(slots), power, played, lastMove)) {
    const value = evaluate(applyMapping(slots, getMapping(move)))
    if (!found || value > best.value) best = { move, value }
    found = true
  }
  return best
}

/**
 * The element of a card on its power side is unknown: the bot weighs each element by the number of its cards not visible yet.
 * It never reads the hidden elements.
 */
const hiddenElementOdds = (slots: Slot[]): [Element, number][] => {
  const left = elements.map((element) => [element, CARDS_PER_ELEMENT - slots.filter((slot) => slot.kind === 'revealed' && slot.element === element).length] as [Element, number])
  const total = left.reduce((sum, [, count]) => sum + count, 0)
  return left.filter(([, count]) => count > 0).map(([element, count]) => [element, count / total])
}

/** Flip a card: the one whose power gives the best value on average, over the elements it can reveal. */
const chooseFlip = (game: Game, player: number): Move => {
  const rules = new ElementisRules(game)
  const state = new GridState(game)
  const slots = snapshot(state.board)
  const odds = hiddenElementOdds(slots)
  const lastMove = state.lastMove
  const noEffect = state.playableCells.length === 0
  let best: { move: Move; value: number } | undefined
  for (const move of rules.getLegalMoves(player)) {
    if (!isMoveItem(move)) continue
    const played = { x: move.location.x!, y: move.location.y! }
    const power = state.powerAt(played)
    let value = 0
    for (const [element, odd] of odds) {
      const revealed = [...slots]
      revealed[key(played)] = { kind: 'revealed', element }
      value += odd * (noEffect ? evaluate(revealed) : bestPowerMove(revealed, power, played, lastMove).value)
    }
    if (!best || value > best.value) best = { move, value }
  }
  return best!.move
}

/** Apply the power of the card just flipped: the move that leaves the best grid. */
const choosePowerMove = (game: Game, player: number): Move => {
  const rules = new ElementisRules(game)
  const state = new GridState(game)
  const legal = rules.getLegalMoves(player)
  const played = rules.remind<Cell>(Memory.PlayedCell)
  const power = rules.remind<Power>(Memory.PlayedPower)
  const { move } = bestPowerMove(snapshot(state.board), power, played, state.lastMove)
  if (!move) return legal[0]
  const chosen = legal.find((candidate) => {
    if (!isMoveItem(candidate)) return false
    if ('push' in move) {
      const entry = entryOf(move.push)
      return candidate.location.type === LocationType.GridEntry && candidate.location.x === entry.x && candidate.location.y === entry.y
    }
    const [a, b] = move.swap
    const item = rules.material(candidate.itemType).getItem(candidate.itemIndex).location
    return sameCell({ x: item.x!, y: item.y! }, a) && sameCell({ x: candidate.location.x!, y: candidate.location.y! }, b)
  })
  return chosen ?? legal[0]
}

/** The moves the bot plays now: a flip, then, once the element is known, the move of its power. */
export const chooseMoves = (game: Game, player: number): Move[] => {
  const rules = new ElementisRules(game)
  if (!rules.getLegalMoves(player).length) return []
  return [game.rule?.id === RuleId.ApplyPower ? choosePowerMove(game, player) : chooseFlip(game, player)]
}

/** The bot of the tutorial, of the partner of a game and of `game.bot()`. It reads only what all the players can see. */
export const ElementisAI = (game: Game, player: number): Promise<Move[]> => Promise.resolve(chooseMoves(game, player))
