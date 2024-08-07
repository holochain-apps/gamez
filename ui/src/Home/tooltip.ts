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
  el.className =
    'absolute whitespace-nowrap pointer-events-none px4 py2 rounded bg-black text-white z-100';
  el.innerHTML = content;

  let timeout = 0;
  function handleMouseEnter() {
    show = true;
    el.style.opacity = '0';
    document.body.appendChild(el);
    console.log('Setting timeout');
    timeout = setTimeout(() => {
      el.style.opacity = '1';
    }, 200);
  }

  function handleMouseMove(ev: MouseEvent) {
    if (show) {
      const elClone = el.cloneNode(true) as HTMLDivElement;
      elClone.style.opacity = '0.5';
      elClone.style.top = ev.clientY + 'px';
      elClone.style.left = ev.clientX + 15 + 'px';
      document.body.appendChild(elClone);
      const { width, left } = elClone.getBoundingClientRect();
      elClone.remove();

      const docWidth = document.documentElement.clientWidth;
      const overflow = left + width + 10 - docWidth;
      const moveLeft = overflow > 0 ? overflow : 0;

      el.style.top = ev.clientY + 'px';
      el.style.left = ev.clientX + 15 - moveLeft + 'px';
    }
  }

  function handleMouseLeave() {
    show = false;
    el.remove();
  }

  node.addEventListener('mouseenter', handleMouseEnter);
  node.addEventListener('mousemove', handleMouseMove);
  node.addEventListener('mouseleave', handleMouseLeave);

  return {
    update(content: string) {
      el.innerHTML = content;
    },
    destroy() {
      clearTimeout(timeout);
      node.removeEventListener('mouseenter', handleMouseEnter);
      node.removeEventListener('mousemove', handleMouseMove);
      node.removeEventListener('mouseleave', handleMouseLeave);
      el.remove();
    },
  };
}
