import { LocationType } from '@gamepark/elementis/material/LocationType'
import { MaterialType } from '@gamepark/elementis/material/MaterialType'
import { PlayerColor } from '@gamepark/elementis/PlayerColor'
import { Locator } from '@gamepark/react-game'

export const Locators: Partial<Record<LocationType, Locator<PlayerColor, MaterialType, LocationType>>> = {}
