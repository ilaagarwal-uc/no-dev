import React, { useEffect, useRef } from 'react';
import styles from './context_menu.module.css';

export interface IContextMenuProps {
  position: { x: number; y: number };
  isVisible: boolean;
  isLocked: boolean;
  onDuplicate: () => void;
  onDelete: () => void;
  onResetTransform: () => void;
  onLockPosition: () => void;
  onClose: () => void;
}

export const ContextMenu: React.FC<IContextMenuProps> = ({
  position,
  isVisible,
  isLocked,
  onDuplicate,
  onDelete,
  onResetTransform,
  onLockPosition,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Add slight delay to prevent immediate close from the long-press event
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('pointerdown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  // Close menu on Escape key
  useEffect(() => {
    if (!isVisible) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, onClose]);

  // Adjust menu position to keep it within viewport
  useEffect(() => {
    if (!isVisible || !menuRef.current) return;

    const menu = menuRef.current;
    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = position.x;
    let adjustedY = position.y;

    // Adjust horizontal position if menu goes off-screen
    if (rect.right > viewportWidth) {
      adjustedX = viewportWidth - rect.width - 10;
    }
    if (adjustedX < 10) {
      adjustedX = 10;
    }

    // Adjust vertical position if menu goes off-screen
    if (rect.bottom > viewportHeight) {
      adjustedY = viewportHeight - rect.height - 10;
    }
    if (adjustedY < 10) {
      adjustedY = 10;
    }

    menu.style.left = `${adjustedX}px`;
    menu.style.top = `${adjustedY}px`;
  }, [isVisible, position]);

  if (!isVisible) return null;

  const handleDuplicate = () => {
    onDuplicate();
    onClose();
  };

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  const handleResetTransform = () => {
    onResetTransform();
    onClose();
  };

  const handleLockPosition = () => {
    onLockPosition();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className={styles.contextMenu}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      role="menu"
      aria-label="Model context menu"
    >
      <button
        className={styles.menuItem}
        onClick={handleDuplicate}
        role="menuitem"
        aria-label="Duplicate model"
      >
        <span className={styles.menuIcon}>⎘</span>
        <span className={styles.menuText}>Duplicate</span>
      </button>

      <button
        className={styles.menuItem}
        onClick={handleDelete}
        role="menuitem"
        aria-label="Delete model"
      >
        <span className={styles.menuIcon}>🗑</span>
        <span className={styles.menuText}>Delete</span>
      </button>

      <button
        className={styles.menuItem}
        onClick={handleResetTransform}
        role="menuitem"
        aria-label="Reset transform to original"
      >
        <span className={styles.menuIcon}>↺</span>
        <span className={styles.menuText}>Reset Transform</span>
      </button>

      <div className={styles.menuDivider} role="separator" />

      <button
        className={`${styles.menuItem} ${isLocked ? styles.active : ''}`}
        onClick={handleLockPosition}
        role="menuitem"
        aria-label={isLocked ? 'Unlock position' : 'Lock position'}
        aria-pressed={isLocked}
      >
        <span className={styles.menuIcon}>{isLocked ? '🔒' : '🔓'}</span>
        <span className={styles.menuText}>
          {isLocked ? 'Unlock Position' : 'Lock Position'}
        </span>
      </button>
    </div>
  );
};
