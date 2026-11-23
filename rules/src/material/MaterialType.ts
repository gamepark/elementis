export enum MaterialType {
  /** id = { front: Element, back: Power }: the power side is visible, the element side only once flipped. */
  ElementCard = 1,
  /** The Elementis card: visible from the start, the starting point of the first turn. */
  ElementisCard,
  /** The Help cards of the 6 powers of the game. id = Power. */
  HelpCard
}
