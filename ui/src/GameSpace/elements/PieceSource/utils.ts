// Element is pill-shaped
export function isWithinVisualBoundary(
  pos: { x: number; y: number },
  element: { x: number; y: number; width: number; height: number },
): boolean {
  const centerX = element.x;
  const centerY = element.y;
  const x = element.x;
  const y = element.y;
  const width = element.width;
  const height = element.height;
  const radius = Math.min(width, height) / 2;

  return isWithinRectangle(pos, x, y, width, height);

  // Quick check: if the point is outside the bounding box of the element
  if (!isWithinRectangle(pos, x, y, width, height)) {
    // console.log('Ouside bounding box');
    return false;
  }

  // Circle case (if width == height, it's a circle)
  if (width === height) {
    return isWithinCircle(pos, centerX, centerY, radius);
  }

  if (width > height) {
    // console.log('Checking rectangle case width > height');
    if (isWithinRectangle(pos, x + radius, y, width - 2 * radius, height)) {
      return true;
    }
    // console.log('Checking left and right semicircles');
    return (
      isWithinCircle(pos, x + radius, centerY, radius) ||
      isWithinCircle(pos, x + width - radius, centerY, radius)
    );
  } else {
    // console.log('Checking rectangle case width < height');
    if (isWithinRectangle(pos, x, y + radius, width, height - 2 * radius)) {
      return true;
    }
    // console.log('Checking top and right semicircles');
    return (
      isWithinCircle(pos, centerX, y + radius, radius) ||
      isWithinCircle(pos, centerX, y + height - radius, radius)
    );
  }
}

function isWithinRectangle(
  pos: { x: number; y: number },
  x: number,
  y: number,
  width: number,
  height: number,
) {
  return pos.x >= x && pos.x <= x + width && pos.y >= y && pos.y <= y + height;
}

function isWithinCircle(pos: { x: number; y: number }, x: number, y: number, radius: number) {
  return Math.sqrt((pos.x - x) ** 2 + (pos.y - y) ** 2) <= radius;
}
