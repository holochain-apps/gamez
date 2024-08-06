// @unocss-include

// Had to roll up my own tooltip tool because sl-tooltip has a weird
// thing where the element inside does not seem to be rendered on the first run
// so when I try to getBoundingClientRect on it, it shows everything as 0
// It's pretty basic but it works. And hey, one less dependency!
// And honestly, better ergonomics too.
export function tooltip(node: HTMLElement, content: string) {
  if (!content) return;

  let show: boolean = false;

  const el = document.createElement("div");
  el.className =
    "absolute pointer-events-none px4 py2 rounded bg-black text-white";
  el.innerHTML = content;

  function handleMouseOver() {
    show = true;
    document.body.appendChild(el);
  }

  function handleMouseMove(ev: MouseEvent) {
    if (show) {
      el.style.top = ev.clientY + "px";
      el.style.left = ev.clientX + 15 + "px";
    }
  }

  function handleMouseOut() {
    show = false;
    el.remove();
  }

  node.addEventListener("mouseover", handleMouseOver);
  node.addEventListener("mousemove", handleMouseMove);
  node.addEventListener("mouseout", handleMouseOut);

  return {
    destroy() {
      node.removeEventListener("mouseover", handleMouseOver);
      node.removeEventListener("mousemove", handleMouseMove);
      node.removeEventListener("mouseout", handleMouseOut);
      el.remove();
    },
  };
}
