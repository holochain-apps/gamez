type Rectangle = { width: number; height: number; top: number; left: number; scale: number };

export function adjustRectToDocument(
  rectangle: Rectangle,
  docDimensions: { width: number; height: number },
): Rectangle {
  const newRectangle = { ...rectangle };

  if (rectangle.width > docDimensions.width) {
    newRectangle.scale = docDimensions.width / rectangle.width;
  }

  const finalWidth = rectangle.width * newRectangle.scale;
  const finalHeight = rectangle.height * newRectangle.scale;

  // Calculate the right and bottom edges of the rectangle
  const rightEdge = newRectangle.left + finalWidth;
  const bottomEdge = newRectangle.top + finalHeight;

  // Adjust left position if the rectangle goes off the left side of the document
  if (newRectangle.left < 0) {
    newRectangle.left = 0; // Set to the minimum left position
  }

  // Adjust top position if the rectangle goes off the top of the document
  if (newRectangle.top < 0) {
    newRectangle.top = 0; // Set to the minimum top position
  }

  // Adjust left position if the right edge of the rectangle goes off the right side of the document
  if (rightEdge > docDimensions.width) {
    newRectangle.left -= rightEdge - docDimensions.width; // Move left to fit within the document width
  }

  // Adjust top position if the bottom edge of the rectangle goes below the bottom of the document
  if (bottomEdge > docDimensions.height) {
    newRectangle.top -= bottomEdge - docDimensions.height; // Move up to fit within the document height
  }

  return newRectangle;
}

export function rectangleToStyle(rect: Rectangle) {
  return `
    top: ${rect.top}px;
    left: ${rect.left}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
    transform: scale(${rect.scale});
    transform-origin: top left;
  `;
}
