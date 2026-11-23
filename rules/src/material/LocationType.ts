export enum LocationType {
  /** The 5 × 5 grid: x = column (0 on the left), y = row (0 at the top). An Element card is flipped when rotation is true. */
  Grid = 1,
  /** The Help cards of the powers of the game, x = position in the line. */
  HelpCards,
  /** P-7: the played card, removed from the grid, waits beside the board to be inserted back. */
  PushedCard,
  /**
   * P-7: where the played card goes back in, just outside an end of its row or column: x = -1 or 5 at the left or right of row y,
   * y = -1 or 5 above or below column x.
   */
  GridEntry
}
