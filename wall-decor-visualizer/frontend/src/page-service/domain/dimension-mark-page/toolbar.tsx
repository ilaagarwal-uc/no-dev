import React, { useState, useRef, useEffect } from 'react';
import * as DimensionMarkDomain from '../../../data-service/domain/dimension-mark/index';
import { IToolbarProps, ToolType } from './interface';
import styles from './toolbar.module.css';

const TOOLS: { id: ToolType; label: string; icon: string }[] = [
  { id: 'polygon', label: 'Polygon', icon: '⬠' },
  { id: 'dimension', label: 'Dimension', icon: '↔️' },
  { id: 'freehand', label: 'Freehand', icon: '✏️' },
  { id: 'arch', label: 'Arch', icon: '⌒' },
  { id: 'concave', label: 'Concave', icon: '⌞' },
  { id: 'convex', label: 'Convex', icon: '⌝' },
  { id: 'pan', label: 'Pan', icon: '✋' }
];

export function Toolbar({
  selectedTool,
  position,
  onToolSelect,
  onPositionChange
}: IToolbarProps): JSX.Element {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      };
      onPositionChange(newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, onPositionChange]);

  return (
    <div
      ref={toolbarRef}
      className={styles.toolbar}
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
      role="toolbar"
      aria-label="Dimension marking tools"
    >
      <div className={styles.toolbarContent}>
        {TOOLS.map(tool => (
          <button
            key={tool.id}
            className={`${styles.toolButton} ${selectedTool === tool.id ? styles.active : ''}`}
            onClick={() => onToolSelect(tool.id)}
            title={tool.label}
            aria-label={tool.label}
            aria-pressed={selectedTool === tool.id}
          >
            <span className={styles.toolIcon}>{tool.icon}</span>
            <span className={styles.toolLabel}>{tool.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
