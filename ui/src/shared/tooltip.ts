// @unocss-include
import { tooltip as svooltip } from 'svooltip';

// Wrapper around svooltip where I can set defaults for all the uses of tooltip
export function tooltip(node: HTMLElement, content: string) {
  if (!content) return;
  return svooltip(node, { content });
}
