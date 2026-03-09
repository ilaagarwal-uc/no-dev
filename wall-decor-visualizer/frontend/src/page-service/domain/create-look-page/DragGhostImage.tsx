import React, { useEffect, useRef } from 'react';
import { ICatalogItem } from './interface.js';
import styles from './drag_ghost_image.module.css';

export interface IDragGhostImageProps {
  item: ICatalogItem | null;
  position: { x: number; y: number };
  isDragging: boolean;
  isValidDropZone: boolean;
  pressure?: number;
}

export function DragGhostImage({
  item,
  position,
  isDragging,
  isValidDropZone,
  pressure = 1.0
}: IDragGhostImageProps): JSX.Element | null {
  const ghostRef = useRef<HTMLDivElement>(null);

  // Update ghost position
  useEffect(() => {
    if (ghostRef.current && isDragging) {
      ghostRef.current.style.left = `${position.x}px`;
      ghostRef.current.style.top = `${position.y}px`;
    }
  }, [position, isDragging]);

  // Apply pressure-based scaling (optional)
  useEffect(() => {
    if (ghostRef.current && isDragging && pressure !== undefined) {
      const scale = 0.8 + (pressure * 0.4); // Range: 0.8x to 1.2x
      ghostRef.current.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }
  }, [pressure, isDragging]);

  if (!item || !isDragging) {
    return null;
  }

  return (
    <div
      ref={ghostRef}
      className={`${styles.ghostImage} ${isValidDropZone ? styles.valid : styles.invalid}`}
      style={{
        left: position.x,
        top: position.y
      }}
    >
      <div className={styles.ghostContent}>
        <img
          src={item.thumbnailUrl}
          alt={item.name}
          className={styles.thumbnail}
        />
        <div className={styles.info}>
          <div className={styles.name}>{item.name}</div>
          <div className={styles.dimensions}>
            {item.dimensions.width}' × {item.dimensions.height}' × {item.dimensions.depth}'
          </div>
        </div>
      </div>
      <div className={styles.indicator}>
        {isValidDropZone ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M8 8l8 8M16 8l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </div>
    </div>
  );
}
