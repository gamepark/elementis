import { applyAutomaticMoves, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { describe, expect, it } from 'vitest'
import { ElementisRules } from '../ElementisRules'
import { ElementisSetup } from '../ElementisSetup'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { ElementCardId, GridState } from '../rules/GridState'
import { RuleId } from '../rules/RuleId'
import { chooseMoves } from './ElementisAI'

type Game = MaterialGame<number, MaterialType, LocationType, RuleId>
type Move = MaterialMove<number, MaterialType, LocationType, RuleId>
type Player = (game: Game, player: number) => Move

const bot: Player = (game, player) => chooseMoves(JSON.parse(JSON.stringify(game)), player)[0]
const random: Player = (game, player) => {
  const legal = new ElementisRules(game).getLegalMoves(player)
  return legal[Math.floor(Math.random() * legal.length)]
}

/** Plays a whole game, the slowest decision of the bot being measured. Returns the final score. */
const playGame = (players: number, play: Player) => {
  const game: Game = new ElementisSetup().setup({ players })
  let slowest = 0
  while (game.rule?.id !== undefined) {
    const player = new ElementisRules(game).getActivePlayer()!
    const start = performance.now()
    const move = play(game, player)
    slowest = Math.max(slowest, performance.now() - start)
    applyAutomaticMoves(new ElementisRules(game), [move])
  }
  return { score: new GridState(game).score, slowest }
}

describe('Bot', { timeout: 300_000 }, () => {
  it.each([1, 2])('plays whole games at %i players, deciding in less than a second', (players) => {
    for (let i = 0; i < 10; i++) {
      const { slowest } = playGame(players, bot)
      expect(slowest).toBeLessThan(1000)
    }
  })

  it('never reads the hidden elements', () => {
    for (let i = 0; i < 20; i++) {
      const game: Game = new ElementisSetup().setup({ players: 2 })
      const player = game.rule!.player!
      const decision = JSON.stringify(chooseMoves(JSON.parse(JSON.stringify(game)), player))
      // Shuffle the elements of the cards still on their power side
      const hidden = game.items[MaterialType.ElementCard]!.filter((item) => !item.location.rotation).map((item) => item.id as ElementCardId)
      const fronts = hidden.map((id) => id.front).reverse()
      hidden.forEach((id, index) => (id.front = fronts[index]))
      expect(JSON.stringify(chooseMoves(JSON.parse(JSON.stringify(game)), player))).toBe(decision)
    }
  })

  it('scores more than random play', () => {
    const games = 20
    const mean = (play: Player) => Array.from({ length: games }, () => playGame(1, play).score).reduce((a, b) => a + b, 0) / games
    const botMean = mean(bot)
    const randomMean = mean(random)
    console.log(`bot ${botMean.toFixed(1)} / random ${randomMean.toFixed(1)} out of 24`)
    expect(botMean).toBeGreaterThan(randomMean + 2)
  })
})
