import { Element } from '@gamepark/elementis/material/Element'
import { Power, powers } from '@gamepark/elementis/material/Power'
import ElementisCard from './cards/elementis.webp'

export { ElementisCard }

type Files = Record<string, string>
const glob = (files: Files) => (name: string) => {
  const url = Object.entries(files).find(([path]) => path.endsWith(`/${name}.webp`))?.[1]
  if (!url) throw new Error(`Missing image ${name}`)
  return url
}

const elementFile = glob(import.meta.glob<string>('./cards/elements/*.webp', { eager: true, import: 'default' }))
const powerFile = glob(import.meta.glob<string>('./cards/powers/*.webp', { eager: true, import: 'default' }))

export const elementNames: Record<Element, string> = {
  [Element.Water]: 'water',
  [Element.Fire]: 'fire',
  [Element.Earth]: 'earth',
  [Element.Air]: 'air'
}

/** The element face of a card depends on its element and on its power, shown in 2 corners. */
export const elementImage = (element: Element, power: Power) => elementFile(`${elementNames[element]}-${power}`)

export const elementImages = Object.values(elementNames).flatMap((element) => powers.map((power) => elementFile(`${element}-${power}`)))

export const powerImages = Object.fromEntries(powers.map((power) => [power, powerFile(`power-${power}`)])) as Record<Power, string>

const helpFile = glob(import.meta.glob<string>('./cards/help/*.webp', { eager: true, import: 'default' }))

/** The Help cards are printed in English and in French: French for the French players, English for all the others. */
export const helpImage = (power: Power, language?: string) => helpFile(`help-${power}-${language?.startsWith('fr') ? 'fr' : 'en'}`)

export const helpImages = powers.flatMap((power) => [helpImage(power, 'en'), helpImage(power, 'fr')])
