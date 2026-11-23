import { getEnumValues } from '@gamepark/rules-api'

/**
 * The 12 powers of the game. Their values are the numbers of the 2026 cards (P-1 to P-15), which are also their column in the
 * images: P-6, P-11 and P-14 were removed by the publisher (02/11/2026), the others keep their number.
 * "The played card" is the card just flipped; it can be one of the 2 swapped cards when it is on the pattern (F18).
 */
export enum Power {
  /** P-1 Swap one inside card for another inside card, including the central card. */
  InsideSwap = 1,
  /** P-2 Swap one outside card for another outside card. */
  OutsideSwap = 2,
  /** P-3 Swap an outside card for an inside card, including the central card. */
  OutsideInsideSwap = 3,
  /** P-4 Swap two cards on the column of the played card. */
  ColumnSwap = 4,
  /** P-5 Swap two cards on the row of the played card. */
  RowSwap = 5,
  /** P-7 Remove the played card, insert it back from the outside by pushing the cards towards the hole. */
  Push = 7,
  /** P-8 Swap two cards on a diagonal of the played card. */
  DiagonalSwap = 8,
  /** P-9 Swap two orthogonally adjacent cards. */
  AdjacentSwap = 9,
  /** P-10 Swap two cards with one card between them, horizontally or vertically. */
  GapSwap = 10,
  /** P-12 Swap two diagonally adjacent cards. */
  DiagonalAdjacentSwap = 12,
  /** P-13 Swap any card with the Elementis card. */
  ElementisSwap = 13,
  /** P-15 Swap the played card with an orthogonally adjacent card. */
  PlayedAdjacentSwap = 15
}

export const powers = getEnumValues(Power)

/** 6 Help cards are drawn at random: they give the powers of the game [R-3]. */
export const POWERS_PER_GAME = 6
