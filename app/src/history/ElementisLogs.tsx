import { Element } from '@gamepark/elementis/material/Element'
import { GRID_SIZE } from '@gamepark/elementis/material/Grid'
import { LocationType } from '@gamepark/elementis/material/LocationType'
import { MaterialType } from '@gamepark/elementis/material/MaterialType'
import { ElementCardId, GridState } from '@gamepark/elementis/rules/GridState'
import { MaterialLogProps, usePlayerName } from '@gamepark/react-game'
import { MaterialGame, MaterialItem, MoveItem } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'

type Props = MaterialLogProps<MoveItem<number, MaterialType, LocationType>>
type Game = MaterialGame<number, MaterialType, LocationType>

/** The player whose turn it is, by name. */
const useActivePlayer = ({ context }: Props) => usePlayerName(context.game.rule?.player)

/** The name of a card of the grid as everyone sees it: its element, the Elementis card, or a card still on its power side. */
const useCardName = (item: MaterialItem<number, LocationType> | undefined, type: MaterialType) => {
  const { t } = useTranslation()
  if (type === MaterialType.ElementisCard) return t('log.card.elementis')
  const element = (item?.id as ElementCardId | undefined)?.front
  return item?.location.rotation && element ? t('log.card.element', { element: t(`element.${element}`) }) : t('log.card.hidden')
}

/** The card in a cell before the move, other than the card moving there. */
const cardAt = (game: Game, x: number, y: number, except: { type: MaterialType; index: number }) => {
  for (const type of [MaterialType.ElementisCard, MaterialType.ElementCard]) {
    const index = game.items[type]?.findIndex(
      (item, i) => item.location.type === LocationType.Grid && item.location.x === x && item.location.y === y && (type !== except.type || i !== except.index)
    )
    if (index !== undefined && index >= 0) return { type, item: game.items[type]![index] }
  }
  return undefined
}

/** "{player} flips a Fire card", and when its power cannot be applied: "its power has no effect" [C-1, F7]. */
export const FlipLog = (props: Props) => {
  const { t } = useTranslation()
  const player = useActivePlayer(props)
  const { move, context } = props
  const element = ((move.reveal?.id ?? context.game.items[MaterialType.ElementCard]![move.itemIndex].id) as ElementCardId | undefined)?.front
  const after: Game = JSON.parse(JSON.stringify(context.game))
  const card = after.items[MaterialType.ElementCard]![move.itemIndex]
  card.location = { ...card.location, rotation: true }
  if (element) (card.id as ElementCardId).front = element
  const noEffect = new GridState(after).powerMoves({ x: card.location.x!, y: card.location.y! }).length === 0
  const values = { player, element: element ? t(`element.${element as Element}`) : '' }
  return <>{t(noEffect ? 'log.flip.no-effect' : 'log.flip', values)}</>
}

/** "{player} swaps the Fire card and a card on its power side" */
export const SwapLog = (props: Props) => {
  const { t } = useTranslation()
  const player = useActivePlayer(props)
  const { move, context } = props
  const moved = context.game.items[move.itemType]![move.itemIndex]
  const other = cardAt(context.game, move.location.x!, move.location.y!, { type: move.itemType, index: move.itemIndex })
  const first = useCardName(moved, move.itemType)
  const second = useCardName(other?.item, other?.type ?? MaterialType.ElementCard)
  return <>{t('log.swap', { player, first, second })}</>
}

/** "{player} inserts the Air card from the left of row 4" */
export const PushLog = (props: Props) => {
  const { t } = useTranslation()
  const player = useActivePlayer(props)
  const { move, context } = props
  const card = useCardName({ ...context.game.items[MaterialType.ElementCard]![move.itemIndex], location: { type: LocationType.Grid, rotation: true } }, MaterialType.ElementCard)
  const { x, y } = move.location
  const side = x! < 0 ? 'left' : x! >= GRID_SIZE ? 'right' : y! < 0 ? 'top' : 'bottom'
  const line = side === 'left' || side === 'right' ? y! + 1 : x! + 1
  return <>{t(`log.push.${side}`, { player, card, line })}</>
}
