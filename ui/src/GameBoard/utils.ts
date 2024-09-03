export function isHollowChessPiece(char: string): boolean {
  // Check that the input is exactly one character long
  if (char.length !== 1) {
    return false;
  }

  // Get the Unicode code point of the character
  const codePoint = char.codePointAt(0);

  // Define the Unicode range for hollowed chess pieces
  const hollowChessRangeStart = 9812;
  const hollowChessRangeEnd = 9817;

  // Check if the code point falls within the hollow chess piece range
  return (
    codePoint !== undefined &&
    codePoint >= hollowChessRangeStart &&
    codePoint <= hollowChessRangeEnd
  );
}

export function hollowedToFilledChessPiece(char: string): string {
  // Shift the char 6 code points
  return String.fromCodePoint(char.codePointAt(0) + 6);
}
