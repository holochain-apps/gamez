// @unocss-include
import { type Placement, tooltip as svooltip } from 'svooltip';

// Wrapper around svooltip where I can set defaults for all the uses of tooltip
export function tooltip(
  node: HTMLElement,
  content: string | { content: string; placement: Placement },
) {
  if (!content) return;
  const text = typeof content === 'string' ? content : content.content;
  const placement = typeof content === 'string' ? 'bottom' : content.placement;
  return svooltip(node, {
    content: text,
    placement,
    target: document.getElementById('tooltips'),
  });
}
