import { type BoxResizeHandles } from '~/Surface';

type Box = { w: number; h: number; x: number; y: number };

interface ResizeConfig {
  expandSymmetrically: boolean;
  keepAspectRatio: boolean;
}

const MIN_SIZE = 30;

export function resizeBox(
  box: Box,
  handle: BoxResizeHandles,
  start: { x: number; y: number },
  end: { x: number; y: number },
  { expandSymmetrically, keepAspectRatio }: ResizeConfig,
): Box {
  const { x, y, w, h } = box;
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  // Decide which axes to actually resize
  const resizeX = handle.includes('l') || handle.includes('r');
  const resizeY = handle.includes('t') || handle.includes('b');

  // 1) Compute newWidth and newX if we are resizing horizontally
  let newWidth = w;
  let newX = x;
  if (resizeX) {
    // The "pivot" depends on left vs right and symmetrical
    let anchorX: number;
    if (expandSymmetrically) {
      // Pivot around the center
      anchorX = x + w / 2;
    } else {
      // If handle is left, pivot is right side; if right, pivot is left side
      anchorX = handle.includes('l') ? x + w : x;
    }

    const fromRight = handle.includes('r');

    // The sign for dx depends on whether the anchor is at the left or right
    // or if symmetrical. We'll interpret "distance from anchor" for new width:
    let distX = anchorX - (start.x + dx * (expandSymmetrically ? 1 : 0));
    // Actually simpler: the user has moved by dx from start, so the total move from anchor is ???
    // A simpler approach is just "position of the pointer relative to anchor."

    // Let’s do it more directly:
    // pointerEndX = end.x
    // distance from anchor = pointerEndX - anchorX
    const pointerEndX = end.x;
    const distanceFromAnchorX = pointerEndX - anchorX;

    const normalizedDistanceFromAnchor = fromRight ? distanceFromAnchorX : -distanceFromAnchorX;

    // If symmetrical, halfWidth is half of total width; else total width is the distance from anchor to pointer
    let totalWidth = expandSymmetrically
      ? normalizedDistanceFromAnchor * 2
      : normalizedDistanceFromAnchor;

    // Keep aspect ratio?
    // We will handle it *after* we compute newHeight if needed, so skip for now.
    newWidth = totalWidth < MIN_SIZE ? MIN_SIZE : totalWidth;

    // Recompute newX based on which side or symmetrical
    if (expandSymmetrically) {
      // pivot = center horizontally
      newX = anchorX - newWidth / 2;
    } else {
      if (handle.includes('l')) {
        // If pivot is the right side, newX = anchorX - newWidth
        newX = anchorX - newWidth;
      } else {
        // pivot is left side, newX = anchorX
        newX = anchorX;
      }
    }
  }

  // 2) Compute newHeight and newY if we are resizing vertically
  let newHeight = h;
  let newY = y;
  if (resizeY) {
    let anchorY: number;
    if (expandSymmetrically) {
      anchorY = y + h / 2;
    } else {
      anchorY = handle.includes('t') ? y + h : y;
    }

    const fromBottom = handle.includes('b');

    const pointerEndY = end.y;
    const distanceFromAnchorY = pointerEndY - anchorY;

    const normalizedDistanceFromAnchor = fromBottom ? distanceFromAnchorY : -distanceFromAnchorY;

    let totalHeight = expandSymmetrically
      ? normalizedDistanceFromAnchor * 2
      : normalizedDistanceFromAnchor;

    newHeight = totalHeight < MIN_SIZE ? MIN_SIZE : totalHeight;

    if (expandSymmetrically) {
      newY = anchorY - newHeight / 2;
    } else {
      if (handle.includes('t')) {
        newY = anchorY - newHeight;
      } else {
        newY = anchorY;
      }
    }
  }

  // 3) If keepAspectRatio is desired and BOTH axes changed,
  //    then we have to enforce aspect ratio.
  //    (Often you only do aspect ratio for corner handles.)
  if (keepAspectRatio && resizeX && resizeY) {
    const aspect = w / h;
    const newRatio = newWidth / newHeight;
    if (newRatio > aspect) {
      // too wide => shrink width
      const w2 = newHeight * aspect;
      // keep the same "anchor" side
      // We must shift X to preserve the anchor if we changed width
      if (expandSymmetrically) {
        const centerX = newX + newWidth / 2;
        newWidth = w2;
        newX = centerX - newWidth / 2;
      } else {
        if (handle.includes('l')) {
          // anchor is right side
          newX += newWidth - w2; // shift to the right by the difference
        }
        newWidth = w2;
      }
    } else {
      // too tall => shrink height
      const h2 = newWidth / aspect;
      if (expandSymmetrically) {
        const centerY = newY + newHeight / 2;
        newHeight = h2;
        newY = centerY - newHeight / 2;
      } else {
        if (handle.includes('t')) {
          // anchor is bottom side
          newY += newHeight - h2;
        }
        newHeight = h2;
      }
    }
  }

  return {
    x: newX,
    y: newY,
    w: newWidth,
    h: newHeight,
  };
}
