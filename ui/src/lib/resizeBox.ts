type BoxResizeHandles = 'l' | 'r' | 'b' | 't' | 'tr' | 'br' | 'tl' | 'bl';
type Box = { w: number; h: number; x: number; y: number };

interface ResizeConfig {
  expandSymmetrically: boolean;
  keepAspectRatio: boolean;
}

// Helper: returns the pivot (anchor) point for each handle.
// If symmetrical, we might always pivot from the center.
function getAnchor(box: Box, handle: BoxResizeHandles, symmetrical: boolean) {
  if (symmetrical) {
    // Always pivot from the center
    return {
      ax: box.x + box.w / 2,
      ay: box.y + box.h / 2,
    };
  }
  // Otherwise, pick a corner/edge that remains fixed
  switch (handle) {
    case 'tl':
      return { ax: box.x + box.w, ay: box.y + box.h };
    case 'tr':
      return { ax: box.x, ay: box.y + box.h };
    case 'bl':
      return { ax: box.x + box.w, ay: box.y };
    case 'br':
      return { ax: box.x, ay: box.y };
    case 'l':
      return { ax: box.x + box.w, ay: box.y + box.h / 2 };
    case 'r':
      return { ax: box.x, ay: box.y + box.h / 2 };
    case 't':
      return { ax: box.x + box.w / 2, ay: box.y + box.h };
    case 'b':
      return { ax: box.x + box.w / 2, ay: box.y };
    default:
      return { ax: box.x, ay: box.y };
  }
}

export function resizeBox(
  initialBox: Box,
  resizeHandle: BoxResizeHandles,
  start: { x: number; y: number },
  end: { x: number; y: number },
  config: ResizeConfig,
): Box {
  const { expandSymmetrically, keepAspectRatio } = config;
  const elBox = { ...initialBox };

  const { x, y, w, h } = initialBox;
  const { ax, ay } = getAnchor(initialBox, resizeHandle, expandSymmetrically);

  const dx = end.x - start.x;
  const dy = end.y - start.y;

  // The anchor is "fixed"; so the new opposite corner should move by dx/dy
  // But if symmetrical, we consider that dx/dy might be "double effect"
  // (because if you move the handle away from the center by 10px,
  //  the other side also moves 10px, etc.)
  const factor = expandSymmetrically ? 2 : 1;

  // Calculate the new corner positions relative to the anchor
  let newOppositeX =
    x + w === ax
      ? ax - factor * dx // if anchor is at right side, we move opposite side left
      : ax + factor * dx; // else move it right

  let newOppositeY = y + h === ay ? ay - factor * dy : ay + factor * dy;

  // Derive new w,h from anchor
  let newWidth = newOppositeX - ax + w;
  let newHeight = newOppositeY - ay + h;

  // Keep aspect ratio if needed
  if (keepAspectRatio) {
    const aspectRatio = w / h;
    const newRatio = newWidth / newHeight;

    if (newRatio > aspectRatio) {
      // Wider than original ratio -> clamp width
      newWidth = newHeight * aspectRatio;
    } else {
      // Taller than original ratio -> clamp height
      newHeight = newWidth / aspectRatio;
    }
  }

  if (newWidth < 20) newWidth = 20;
  if (newHeight < 20) newHeight = 20;

  // Based on the anchor, recalculate x,y
  const newX =
    x === ax
      ? ax // anchor is left side
      : ax - newWidth; // anchor is right side, so x is anchor - width

  const newY = y === ay ? ay : ay - newHeight;

  // If symmetrical pivot was center, we do the center math:
  // newX = ax - newWidth/2, newY = ay - newHeight/2
  // if expandSymmetrically is true.
  let finalX = newX;
  let finalY = newY;
  if (expandSymmetrically) {
    finalX = ax - newWidth / 2;
    finalY = ay - newHeight / 2;
  }

  return {
    x: finalX,
    y: finalY,
    w: newWidth,
    h: newHeight,
  };

  console.log(x, newX);

  if (resizeHandle === 'br') {
    // elBox.x -= dx;
    // elBox.y -= dy;
    elBox.w += dx;
    elBox.h += dy;
  } else if (resizeHandle === 'bl') {
    elBox.x += dx;
    elBox.w -= dx;
    elBox.h += dy;
  } else if (resizeHandle === 'tl') {
    elBox.x += dx;
    elBox.y += dy;
    elBox.w -= dx;
    elBox.h -= dy;
  } else if (resizeHandle === 'tr') {
    elBox.y += dy;
    elBox.w += dx;
    elBox.h -= dy;
  } else if (resizeHandle === 't') {
    elBox.y += dy;
    elBox.h -= dy;
  } else if (resizeHandle === 'r') {
    elBox.w += dx;
  } else if (resizeHandle === 'b') {
    elBox.h += dy;
  } else if (resizeHandle === 'l') {
    elBox.x += dx;
    elBox.w -= dx;
  }
  if (elBox.w < 20) {
    elBox.w = 20;
  }
  if (elBox.h < 20) {
    elBox.h = 20;
  }
  if (elBox.x > initialBox.x + initialBox.w - 20) {
    elBox.x = initialBox.x + initialBox.w - 20;
  }
  if (elBox.y > initialBox.y + initialBox.h - 20) {
    elBox.y = initialBox.y + initialBox.h - 20;
  }

  return elBox;
}

// The main function
export function resizeBox2(
  initialBox: Box,
  handle: BoxResizeHandles,
  start: { x: number; y: number },
  end: { x: number; y: number },
  config: ResizeConfig,
): Box {
  const { expandSymmetrically, keepAspectRatio } = config;

  const { x, y, w, h } = initialBox;
  const { ax, ay } = getAnchor(initialBox, handle, expandSymmetrically);

  const dx = end.x - start.x;
  const dy = end.y - start.y;

  // The anchor is "fixed"; so the new opposite corner should move by dx/dy
  // But if symmetrical, we consider that dx/dy might be "double effect"
  // (because if you move the handle away from the center by 10px,
  //  the other side also moves 10px, etc.)
  const factor = expandSymmetrically ? 2 : 1;

  // Calculate the new corner positions relative to the anchor
  let newOppositeX =
    x + w === ax
      ? ax - factor * dx // if anchor is at right side, we move opposite side left
      : ax + factor * dx; // else move it right

  let newOppositeY = y + h === ay ? ay - factor * dy : ay + factor * dy;

  // Derive new w,h from anchor
  let newWidth = Math.abs(newOppositeX - ax);
  let newHeight = Math.abs(newOppositeY - ay);

  // Keep aspect ratio if needed
  if (keepAspectRatio) {
    const aspectRatio = w / h;
    const newRatio = newWidth / newHeight;

    if (newRatio > aspectRatio) {
      // Wider than original ratio -> clamp width
      newWidth = newHeight * aspectRatio;
    } else {
      // Taller than original ratio -> clamp height
      newHeight = newWidth / aspectRatio;
    }
  }

  // Enforce minimum size of 20
  if (newWidth < 20) newWidth = 20;
  if (newHeight < 20) newHeight = 20;

  // Based on the anchor, recalculate x,y
  const newX =
    x === ax
      ? ax // anchor is left side
      : ax - newWidth; // anchor is right side, so x is anchor - width

  const newY = y === ay ? ay : ay - newHeight;

  // If symmetrical pivot was center, we do the center math:
  // newX = ax - newWidth/2, newY = ay - newHeight/2
  // if expandSymmetrically is true.
  let finalX = newX;
  let finalY = newY;
  if (expandSymmetrically) {
    finalX = ax - newWidth / 2;
    finalY = ay - newHeight / 2;
  }

  // Return new box
  return {
    x: finalX,
    y: finalY,
    w: newWidth,
    h: newHeight,
  };
}
