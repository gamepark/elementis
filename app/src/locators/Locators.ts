import { gridCells } from '@gamepark/elementis/material/Grid'
import { LocationType } from '@gamepark/elementis/material/LocationType'
import { MaterialType } from '@gamepark/elementis/material/MaterialType'
import { DropAreaDescription, ItemContext, Locator } from '@gamepark/react-game'
import { isMoveItem, Location, MaterialMove } from '@gamepark/rules-api'
import { cardBorderRadius, cardSize, gridCellCoordinates, helpCardCoordinates } from './TableLayout'

type Loc = Location<number, LocationType>

/** Each cell of the grid can receive a card: a card dropped on another one swaps with it, a pushed card goes in at an end. */
class GridCellDescription extends DropAreaDescription<number, MaterialType, LocationType> {
  width = cardSize
  height = cardSize
  borderRadius = cardBorderRadius

  /** A card keeps its side when it moves: a flipped card goes there with rotation true, so only the cell is compared. */
  canDrop(move: MaterialMove<number, MaterialType, LocationType>, location: Loc, context: ItemContext<number, MaterialType, LocationType>) {
    if (!isMoveItem(move) || move.location.type !== LocationType.Grid || move.location.x !== location.x || move.location.y !== location.y) return false
    const { x, y } = context.rules.material(move.itemType).getItem(move.itemIndex).location
    return x !== location.x || y !== location.y
  }
}

class GridLocator extends Locator<number, MaterialType, LocationType> {
  locationDescription = new GridCellDescription()

  getLocations() {
    return gridCells.map((cell) => ({ type: LocationType.Grid, ...cell }))
  }

  getCoordinates(location: Loc) {
    return gridCellCoordinates(location.x!, location.y!)
  }
}

class HelpCardsLocator extends Locator<number, MaterialType, LocationType> {
  getCoordinates(location: Loc) {
    return helpCardCoordinates(location.x!)
  }
}

export const Locators: Partial<Record<LocationType, Locator<number, MaterialType, LocationType>>> = {
  [LocationType.Grid]: new GridLocator(),
  [LocationType.HelpCards]: new HelpCardsLocator()
}
