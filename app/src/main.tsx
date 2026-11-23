import { ElementisAI } from '@gamepark/elementis/ai/ElementisAI'
import { ElementisOptionsSpecV2 } from '@gamepark/elementis/ElementisOptions'
import { ElementisRules } from '@gamepark/elementis/ElementisRules'
import { ElementisSetup } from '@gamepark/elementis/ElementisSetup'
import { GameProvider } from '@gamepark/react-game'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { gameAnimations } from './animations/GameAnimations'
import { App } from './App'
import { ElementisHistory } from './history/ElementisHistory'
import { Locators } from './locators/Locators'
import { Material } from './material/Material'
import { ElementisScoring } from './scoring/ElementisScoring'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameProvider
      game="elementis"
      Rules={ElementisRules}
      optionsSpec={ElementisOptionsSpecV2}
      GameSetup={ElementisSetup}
      material={Material}
      locators={Locators}
      animations={gameAnimations}
      ai={ElementisAI}
      scoring={new ElementisScoring()}
      logs={new ElementisHistory()}
    >
      <App />
    </GameProvider>
  </StrictMode>
)
