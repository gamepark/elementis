import { LocationType } from '@gamepark/elementis/material/LocationType'
import { MaterialType } from '@gamepark/elementis/material/MaterialType'
import { ItemContext } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'
import { tableBounds } from './TableLayout'

/** A Help card under the pointer is shown twice as big, so that its text can be read. */
const HOVER_SCALE = 2

/** How far a span has to move along one axis to lie between `min` and `max`: nothing when it already does. */
const pushInside = (center: number, half: number, min: number, max: number): number => Math.min(Math.max(center, min + half), max - half) - center

/** The transform of a hovered card: lifted above the others, twice as big, pushed back inside the table at its edges. */
export const cardHoverTransform = (item: MaterialItem<number, LocationType>, context: ItemContext<number, MaterialType, LocationType>): string[] => {
  const locator = context.locators[item.location.type]
  const description = context.material[context.type]
  if (!locator || !description) return []
  const { x = 0, y = 0 } = locator.getItemCoordinates(item, context)
  const { width, height } = description.getSize(item.id)
  const dx = pushInside(x, (width * HOVER_SCALE) / 2, tableBounds.xMin, tableBounds.xMax)
  const dy = pushInside(y, (height * HOVER_SCALE) / 2, tableBounds.yMin, tableBounds.yMax)
  return [`translate3d(${dx}em, ${dy}em, 10em)`, `scale(${HOVER_SCALE})`]
}
