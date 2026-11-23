export enum Memory {
  /** The cards moved by the power of the previous turn: [from, to] cells, for [R-5b]. Absent after a power without effect. */
  LastMove = 1,
  /** The cell of the card flipped this turn, whose power is applied. */
  PlayedCell,
  /** The power of the card flipped this turn. */
  PlayedPower,
  /** Expert mode: the size of the largest zone of each element is not shown during the game. */
  Expert,
  /** The cell the first card of a swap or a push leaves, until the move is completed. */
  MoveOrigin
}
