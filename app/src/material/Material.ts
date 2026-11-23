import { LocationType } from '@gamepark/elementis/material/LocationType'
import { MaterialType } from '@gamepark/elementis/material/MaterialType'
import { Power } from '@gamepark/elementis/material/Power'
import { ElementCardId } from '@gamepark/elementis/rules/GridState'
import { CardDescription, ItemContext, MaterialDescription } from '@gamepark/react-game'
import { isMoveItemType, MaterialMove } from '@gamepark/rules-api'
import { ElementisCard, elementImage, elementImages, powerImages } from '../images/Images'
import { cardBorderRadius, cardSize, helpCardSize } from '../locators/TableLayout'

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

  /** A click on a card on its power side flips it. */
  canShortClick(move: MaterialMove<number, MaterialType, LocationType>, context: Context) {
    return isMoveItemType(MaterialType.ElementCard)(move) && move.itemIndex === context.index && move.location.rotation === true
  }
}

class ElementisCardDescription extends CardDescription<number, MaterialType, LocationType> {
  width = cardSize
  height = cardSize
  borderRadius = cardBorderRadius
  image = ElementisCard
}

/** A Help card shows the pattern of a power of the game: the power side of its cards. */
class HelpCardDescription extends CardDescription<number, MaterialType, LocationType, Power> {
  width = helpCardSize
  height = helpCardSize
  borderRadius = cardBorderRadius
  images = powerImages
}

export const Material: Partial<Record<MaterialType, MaterialDescription<number, MaterialType, LocationType>>> = {
  [MaterialType.ElementCard]: new ElementCardDescription(),
  [MaterialType.ElementisCard]: new ElementisCardDescription(),
  [MaterialType.HelpCard]: new HelpCardDescription()
}
