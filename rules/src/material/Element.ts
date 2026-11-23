import { getEnumValues } from '@gamepark/rules-api'

/** The 4 elements [R-2]: 12 Element cards of each. */
export enum Element {
  Water = 1,
  Fire,
  Earth,
  Air
}

export const elements = getEnumValues(Element)
