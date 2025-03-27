type Pos = { x: number; y: number };
type Box = { x: number; y: number; w: number; h: number };

export default class Viewport {
  // Screen = client screen position as told by the browser
  // Container = container element position (left and top applied)
  // Space = virtual canvas position (pan and zoom applied)

  public zoom: number = 1;
  public panX: number = 0;
  public panY: number = 0;
  public rect: DOMRect = null!;

  constructor() {}

  screenToContainer({ x: clientX, y: clientY }: { x: number; y: number }): {
    x: number;
    y: number;
  } {
    return { x: clientX - this.rect.left, y: clientY - this.rect.top };
  }

  containerToSpace(pos: { x: number; y: number }) {
    return { x: pos.x / this.zoom - this.panX, y: pos.y / this.zoom - this.panY };
  }

  screenToSpace(pos: { x: number; y: number }) {
    return this.containerToSpace(this.screenToContainer(pos));
  }

  isWithinContainer(clientPos: Pos) {
    const { left, top, width, height } = this.rect!;
    return !(
      clientPos.x < left ||
      clientPos.x > left + width ||
      clientPos.y < top ||
      clientPos.y > top + height
    );
  }

  boxCenteredAt(pos: Pos, size: { w: number; h: number }): Box {
    return {
      x: pos.x - size.w / 2,
      y: pos.y - size.h / 2,
      w: size.w,
      h: size.h,
    };
  }
}
