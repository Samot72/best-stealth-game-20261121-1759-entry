// Lamplight input: WASD / arrow keys held down, plus click-to-walk with the mouse.

export function createInput(canvas) {
  const keys = new Set();
  let walkTarget = null;

  window.addEventListener('keydown', (event) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) event.preventDefault();
    keys.add(event.key.toLowerCase());
    walkTarget = null;
  });
  window.addEventListener('keyup', (event) => keys.delete(event.key.toLowerCase()));
  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    walkTarget = {
      x: (event.clientX - rect.left) * (canvas.width / rect.width),
      y: (event.clientY - rect.top) * (canvas.height / rect.height),
    };
  });

  /** Current movement as a unit vector; keyboard wins over click-to-walk. */
  function readMove(player) {
    let x = 0;
    let y = 0;
    if (keys.has('a') || keys.has('arrowleft')) x -= 1;
    if (keys.has('d') || keys.has('arrowright')) x += 1;
    if (keys.has('w') || keys.has('arrowup')) y -= 1;
    if (keys.has('s') || keys.has('arrowdown')) y += 1;
    if (x !== 0 || y !== 0) {
      const len = Math.hypot(x, y);
      return { x: x / len, y: y / len };
    }
    if (walkTarget) {
      const dx = walkTarget.x - player.x;
      const dy = walkTarget.y - player.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 6) { walkTarget = null; return { x: 0, y: 0 }; }
      return { x: dx / dist, y: dy / dist };
    }
    return { x: 0, y: 0 };
  }

  function pressed(code) {
    return keys.has(code);
  }

  return { readMove, pressed };
}
