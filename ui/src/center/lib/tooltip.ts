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
  const sv = svooltip(node, {
    content: text,
    placement,
    target: document.getElementById('tooltips'),
  });

  return {
    destroy() {
      sv.destroy();
    },
    update(newContent: string | { content: string; placement: Placement }) {
      if (!newContent) return;
      const text = typeof newContent === 'string' ? newContent : newContent.content;
      const placement = typeof newContent === 'string' ? 'bottom' : newContent.placement;
      sv.update({ content: text, placement });
    },
  };
}
