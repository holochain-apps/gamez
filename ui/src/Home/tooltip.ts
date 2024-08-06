// @unocss-include

// Had to roll up my own tooltip tool because sl-tooltip has a weird
// thing where the element inside does not seem to be rendered on the first run
// so when I try to getBoundingClientRect on it, it shows everything as 0
// It's pretty basic but it works. And hey, one less dependency!
// And honestly, better ergonomics too.
export function tooltip(node: HTMLElement, content: string) {
  if (!content) return;

  let show: boolean = false;

  const el = document.createElement('div');
  el.className = 'absolute pointer-events-none px4 py2 rounded bg-black text-white';
  el.innerHTML = content;

  let timeout = 0;
  function handleMouseOver() {
    show = true;
    el.style.opacity = '0';
    document.body.appendChild(el);
    timeout = setTimeout(() => {
      el.style.opacity = '1';
    }, 200);
  }

  function handleMouseMove(ev: MouseEvent) {
    if (show) {
      el.style.top = ev.clientY + 'px';
      el.style.left = ev.clientX + 15 + 'px';
      const { width, left } = el.getBoundingClientRect();
      const docWidth = document.documentElement.clientWidth;
      const overflow = left + width - docWidth;
      const moveLeft = overflow > 0 ? overflow : 0;

      // const moveLeft = overflow > 0 ? left - width : 0;
      el.style.left = ev.clientX + 15 - moveLeft + 'px';
      // console.log(width, left, docWidth);
      // el.style.transform = 'translateX(' + moveLeft + 'px)';
    }
  }

  function handleMouseOut() {
    show = false;
    el.remove();
  }

  node.addEventListener('mouseover', handleMouseOver);
  node.addEventListener('mousemove', handleMouseMove);
  node.addEventListener('mouseout', handleMouseOut);

  return {
    destroy() {
      clearTimeout(timeout);
      node.removeEventListener('mouseover', handleMouseOver);
      node.removeEventListener('mousemove', handleMouseMove);
      node.removeEventListener('mouseout', handleMouseOut);
      el.remove();
    },
  };
}
