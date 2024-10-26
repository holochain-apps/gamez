export function playerColor(i: number, playersCount: number) {
  if (i === -1) return '';
  const hue = (i / playersCount) * 360;
  return `hsl(${hue}, 60%, 50%)`;
}
