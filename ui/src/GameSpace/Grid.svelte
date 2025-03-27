<script lang="ts">
  export let vp: { panX: number; panY: number; zoom: number };
  const { panX, panY, zoom } = vp;

  let gridEl: HTMLCanvasElement;

  $: {
    if (gridEl) {
      const gridSize = (zoom > 1 ? 15 : zoom === 0.5 ? 60 : 30) * zoom;
      const gridColor = '#fff3';

      const { width, height } = gridEl.getBoundingClientRect();
      gridEl.width = width; // Ensure the canvas is resized properly
      gridEl.height = height;

      const physicalPanX = panX * zoom;
      const physicalPanY = panY * zoom;

      const ctx = gridEl.getContext('2d');

      // Clear the canvas
      ctx.clearRect(0, 0, width, height);

      // Draw the grid
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 0.5;

      // Apply panning and zooming
      ctx.save();
      ctx.translate((physicalPanX % gridSize) - gridSize, (physicalPanY % gridSize) - gridSize);

      // Vertical lines
      for (let x = 0; x <= width + gridSize; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height + gridSize * 2);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y <= height + gridSize * 2; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width + gridSize, y);
        ctx.stroke();
      }

      ctx.restore();

      // ctx.lineWidth = 2;
      // ctx.strokeStyle = '#fff6';

      // if (physicalPanX > 0 && physicalPanX < width) {
      //   const centerX = physicalPanX;
      //   ctx.beginPath();
      //   ctx.moveTo(centerX, 0);
      //   ctx.lineTo(centerX, height);
      //   ctx.stroke();
      // }

      // if (physicalPanY > 0 && physicalPanY < height) {
      //   const centerY = physicalPanY;
      //   ctx.beginPath();
      //   ctx.moveTo(0, centerY);
      //   ctx.lineTo(width, centerY);
      //   ctx.stroke();
      // }
    }
  }
</script>

<canvas bind:this={gridEl} class="absolute w-full h-full pointer-events-none bg-blue-500/15"
></canvas>
