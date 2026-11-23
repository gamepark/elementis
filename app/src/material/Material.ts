import { LocationType } from '@gamepark/elementis/material/LocationType'
import { MaterialType } from '@gamepark/elementis/material/MaterialType'
import { Power } from '@gamepark/elementis/material/Power'
import { ElementCardId } from '@gamepark/elementis/rules/GridState'
import { CardDescription, ItemContext, MaterialDescription } from '@gamepark/react-game'
import { isMoveItemType, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import i18next from 'i18next'
import { ElementisCard, elementImage, elementImages, helpImage, helpImages, powerImages } from '../images/Images'
import { cardBorderRadius, cardSize, helpCardSize } from '../locators/TableLayout'
import { canPlay, gridCardCss } from './GridHighlights'
import { ElementCardHelp } from './help/ElementCardHelp'
import { ElementisCardHelp } from './help/ElementisCardHelp'
import { HelpCardHelp } from './help/HelpCardHelp'

type Context = ItemContext<number, MaterialType, LocationType>

/**
 * An Element card: its power side is the back, its element side the front. The element is hidden by the rules while the card is
 * on its power side, so the card shows its back. The element face also depends on the power, shown in 2 corners.
 */
class ElementCardDescription extends CardDescription<number, MaterialType, LocationType, ElementCardId> {
  width = cardSize
  height = cardSize
  borderRadius = cardBorderRadius
  backImages = powerImages
  help = ElementCardHelp

  getFrontId(itemId: ElementCardId) {
    return itemId?.front
  }

  getBackId(itemId: ElementCardId) {
    return itemId?.back
  }

  getImage(itemId: ElementCardId) {
    return itemId?.front ? elementImage(itemId.front, itemId.back) : undefined
  }

  getImages() {
    return [...elementImages, ...Object.values(powerImages)]
  }

  /** A click on a card on its power side flips it where it is. A swap is played by dragging a card onto the other. */
  canShortClick(move: MaterialMove<number, MaterialType, LocationType>, context: Context) {
    if (!isMoveItemType(MaterialType.ElementCard)(move) || move.itemIndex !== context.index) return false
    const { x, y, rotation } = context.rules.material(MaterialType.ElementCard).getItem(context.index).location
    return !rotation && move.location.rotation === true && move.location.x === x && move.location.y === y
  }

  highlight(_item: MaterialItem<number, LocationType>, context: Context) {
    return canPlay(context)
  }

  getItemExtraCss(item: MaterialItem<number, LocationType>, context: Context) {
    return gridCardCss(item, context)
  }
}

class ElementisCardDescription extends CardDescription<number, MaterialType, LocationType> {
  width = cardSize
  height = cardSize
  borderRadius = cardBorderRadius
  image = ElementisCard
  help = ElementisCardHelp

  highlight(_item: MaterialItem<number, LocationType>, context: Context) {
    return canPlay(context)
  }

  getItemExtraCss(item: MaterialItem<number, LocationType>, context: Context) {
    return gridCardCss(item, context)
  }
}

/** A Help card explains a power of the game: its pattern and its text, printed in English and in French. */
class HelpCardDescription extends CardDescription<number, MaterialType, LocationType, Power> {
  width = helpCardSize
  height = helpCardSize
  borderRadius = cardBorderRadius
  help = HelpCardHelp

  getImage(power: Power) {
    return helpImage(power, i18next.language)
  }

  getImages() {
    return helpImages
  }
}

export const Material: Partial<Record<MaterialType, MaterialDescription<number, MaterialType, LocationType>>> = {
  [MaterialType.ElementCard]: new ElementCardDescription(),
  [MaterialType.ElementisCard]: new ElementisCardDescription(),
  [MaterialType.HelpCard]: new HelpCardDescription()
}
