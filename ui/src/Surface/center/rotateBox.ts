type Box = { w: number; h: number; x: number; y: number; r: number };

const SNAP = 15;

// Return the rotated box, with r = 0-359 snapped to SNAP degrees angles
// Start and End represent the cursor position where the rotation handle
// is picked up and where it's currently being held
// The rotation happens around the center of the box
// The rotation handle is the top of the box, if the box is rotated, the handle is also rotated;
// alas, the start and end position are absolute, so they don't change with the box rotation
export function rotateBox(
  box: Box,
  start: { x: number; y: number },
  end: { x: number; y: number },
): Box {
  console.log('Rotating box', box);
  // Box center
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;

  // Get angles for start and end positions (relative to center)
  const startAngle = Math.atan2(start.y - cy, start.x - cx);
  const endAngle = Math.atan2(end.y - cy, end.x - cx);

  // Compute angle difference in degrees
  const angleDiffDeg = ((endAngle - startAngle) * 180) / Math.PI;

  // Add difference to current rotation
  let newRotation = box.r + angleDiffDeg;

  // Normalize to 0-360 range
  newRotation = ((newRotation % 360) + 360) % 360;

  // Snap to nearest multiple of SNAP
  const snapped = Math.round(newRotation / SNAP) * SNAP;

  // Return updated box
  return { ...box, r: snapped % 360 };
}
