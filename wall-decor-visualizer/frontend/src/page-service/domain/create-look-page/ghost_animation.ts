/**
 * Animation utilities for drag ghost image
 */

/**
 * Animate ghost image returning to catalog on invalid drop
 */
export function animateGhostReturn(
  ghostElement: HTMLElement,
  currentPosition: { x: number; y: number },
  returnPosition: { x: number; y: number },
  duration: number = 400,
  onComplete?: () => void
): void {
  const startTime = Date.now();
  const startX = currentPosition.x;
  const startY = currentPosition.y;
  const deltaX = returnPosition.x - startX;
  const deltaY = returnPosition.y - startY;

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1.0);

    // Ease-in-out cubic
    const eased = progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    // Interpolate position
    const currentX = startX + deltaX * eased;
    const currentY = startY + deltaY * eased;

    // Update ghost position
    ghostElement.style.left = `${currentX}px`;
    ghostElement.style.top = `${currentY}px`;

    // Fade out as it returns
    ghostElement.style.opacity = `${1 - progress * 0.5}`;

    if (progress < 1.0) {
      requestAnimationFrame(animate);
    } else {
      // Animation complete
      if (onComplete) {
        onComplete();
      }
    }
  };

  animate();
}

/**
 * Animate ghost image scale based on pressure
 */
export function updateGhostScale(
  ghostElement: HTMLElement,
  pressure: number,
  minScale: number = 0.8,
  maxScale: number = 1.2
): void {
  const scale = minScale + (pressure * (maxScale - minScale));
  ghostElement.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

/**
 * Pulse animation for ghost image when hovering over valid drop zone
 */
export function pulseGhostImage(
  ghostElement: HTMLElement,
  isValid: boolean
): void {
  if (isValid) {
    ghostElement.style.animation = 'ghost-pulse 1s ease-in-out infinite';
  } else {
    ghostElement.style.animation = 'none';
  }
}
