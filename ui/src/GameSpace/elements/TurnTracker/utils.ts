export function formatTime(time: number) {
  const minutes = Math.floor(time / 1000 / 60);
  const seconds = Math.floor((time / 1000) % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
