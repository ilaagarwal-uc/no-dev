import React, { useState, useRef, useEffect } from 'react';
import { ICatalogItem } from '../../../data-service/domain/create-look/create_look_schema';
import styles from './catalog_item_card.module.css';

interface ICatalogItemCardProps {
  item: ICatalogItem;
  onDragStart: (item: ICatalogItem, event: React.PointerEvent) => void;
  onTap: (item: ICatalogItem) => void;
  isFocused?: boolean;
  onFocus?: () => void;
}

const LONG_PRESS_DURATION = 500; // 500ms for drag initiation

export const CatalogItemCard: React.FC<ICatalogItemCardProps> = ({
  item,
  onDragStart,
  onTap,
  isFocused = false,
  onFocus,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDraggingRef = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // Auto-focus when isFocused changes
  useEffect(() => {
    if (isFocused && cardRef.current) {
      cardRef.current.focus();
    }
  }, [isFocused]);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // Only handle pen or touch input
    if (event.pointerType !== 'pen' && event.pointerType !== 'touch') {
      return;
    }

    setIsPressed(true);
    isDraggingRef.current = false;

    // Start long press timer for drag initiation
    longPressTimerRef.current = setTimeout(() => {
      isDraggingRef.current = true;
      
      // Provide haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      // Initiate drag
      onDragStart(item, event);
    }, LONG_PRESS_DURATION);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    setIsPressed(false);

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // If not dragging, treat as tap
    if (!isDraggingRef.current) {
      onTap(item);
    }

    isDraggingRef.current = false;
  };

  const handlePointerCancel = () => {
    setIsPressed(false);

    // Clear long press timer
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    isDraggingRef.current = false;
  };

  const handlePointerLeave = () => {
    // Don't clear pressed state if dragging
    if (!isDraggingRef.current) {
      setIsPressed(false);
      
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    // Enter or Space to select
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onTap(item);
    }
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      panels: '#4caf50',
      lights: '#ffc107',
      cove: '#2196f3',
      bidding: '#9c27b0',
      artwork: '#ff5722',
      other: '#607d8b',
    };
    return colors[category] || colors.other;
  };

  const ariaLabel = `${item.name}, ${item.category} category, dimensions ${item.dimensions.width} by ${item.dimensions.height} by ${item.dimensions.depth} feet${item.unitCost !== undefined ? `, costs $${item.unitCost.toFixed(2)}` : ''}. Tap to select or hold to drag onto wall.`;

  return (
    <div
      ref={cardRef}
      className={`${styles.card} ${isPressed ? styles.pressed : ''}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerLeave}
      onFocus={onFocus}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-describedby={`catalog-item-${item.id}-details`}
      onKeyDown={handleKeyDown}
    >
      {/* Thumbnail */}
      <div className={styles.thumbnailContainer}>
        {isLoading && (
          <div className={styles.skeleton} aria-label="Loading thumbnail">
            <div className={styles.skeletonShimmer} />
          </div>
        )}
        
        {imageError ? (
          <div className={styles.placeholderImage}>
            <span className={styles.placeholderIcon}>📦</span>
            <span className={styles.placeholderText}>No Image</span>
          </div>
        ) : (
          <img
            src={item.thumbnailUrl}
            alt={item.name}
            className={styles.thumbnail}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ display: isLoading ? 'none' : 'block' }}
          />
        )}

        {/* Category Badge */}
        <div
          className={styles.categoryBadge}
          style={{ backgroundColor: getCategoryColor(item.category) }}
        >
          {item.category}
        </div>
      </div>

      {/* Item Details */}
      <div className={styles.details} id={`catalog-item-${item.id}-details`}>
        <h3 className={styles.name} aria-label={`Model name: ${item.name}`}>{item.name}</h3>
        <p className={styles.dimensions} aria-label={`Dimensions: ${item.dimensions.width} by ${item.dimensions.height} by ${item.dimensions.depth} feet`}>
          {item.dimensions.width}' × {item.dimensions.height}' × {item.dimensions.depth}'
        </p>
        {item.unitCost !== undefined && (
          <p className={styles.cost} aria-label={`Unit cost: $${item.unitCost.toFixed(2)}`}>${item.unitCost.toFixed(2)}</p>
        )}
      </div>

      {/* Long Press Hint */}
      <div className={styles.dragHint}>
        Hold to drag
      </div>
    </div>
  );
};
