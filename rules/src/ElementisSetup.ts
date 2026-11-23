import { MaterialGameSetup } from '@gamepark/rules-api'
import { ElementisOptions } from './ElementisOptions'
import { ElementisRules } from './ElementisRules'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { PlayerColor } from './PlayerColor'
import { RuleId } from './rules/RuleId'

/**
 * This class creates a new Game based on the game options
 */
export class ElementisSetup extends MaterialGameSetup<PlayerColor, MaterialType, LocationType, ElementisOptions> {
  Rules = ElementisRules

  setupMaterial(_options: ElementisOptions) {
    // TODO
  }

  start() {
    this.startPlayerTurn(RuleId.TheFirstStep, this.players[0])
  }
}
