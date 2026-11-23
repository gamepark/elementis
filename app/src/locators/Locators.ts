import { gridCells } from '@gamepark/elementis/material/Grid'
import { LocationType } from '@gamepark/elementis/material/LocationType'
import { MaterialType } from '@gamepark/elementis/material/MaterialType'
import { DropAreaDescription, ItemContext, Locator, MaterialContext } from '@gamepark/react-game'
import { isMoveItem, Location, MaterialMove } from '@gamepark/rules-api'
import { pushEntries } from '../material/GridHighlights'
import { EntryArrow } from './EntryArrow'
import { arrowSize, cardBorderRadius, cardSize, gridCellCoordinates, gridEntryCoordinates, helpCardCoordinates, pushedCardCoordinates } from './TableLayout'

type Loc = Location<number, LocationType>

/** Each cell of the grid can receive a card: a card dropped on another one swaps with it. */
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

/** P-7: the played card waits beside the board. */
class PushedCardLocator extends Locator<number, MaterialType, LocationType> {
  coordinates = pushedCardCoordinates
}

/** P-7: an arrow outside the grid, where the played card can go back in: a click on it, or dropping the card on it, inserts it there. */
class GridEntryDescription extends DropAreaDescription<number, MaterialType, LocationType> {
  width = arrowSize
  height = arrowSize
  borderRadius = arrowSize / 2
  placeOnShortClick = true
  content = EntryArrow
}

class GridEntryLocator extends Locator<number, MaterialType, LocationType> {
  locationDescription = new GridEntryDescription()

  getLocations(context: MaterialContext<number, MaterialType, LocationType>) {
    return pushEntries(context)
  }

  getCoordinates(location: Loc) {
    return gridEntryCoordinates(location.x!, location.y!)
  }
}

export const Locators: Partial<Record<LocationType, Locator<number, MaterialType, LocationType>>> = {
  [LocationType.Grid]: new GridLocator(),
  [LocationType.HelpCards]: new HelpCardsLocator(),
  [LocationType.PushedCard]: new PushedCardLocator(),
  [LocationType.GridEntry]: new GridEntryLocator()
}
