import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ICatalogItem, CatalogCategory } from '../../../data-service/domain/create-look/create_look_schema';
import { CatalogItemCard } from './CatalogItemCard';
import styles from './catalog_sidebar.module.css';

interface ICatalogSidebarProps {
  catalogItems: ICatalogItem[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onDragStart: (item: ICatalogItem, event: React.PointerEvent) => void;
  onItemSelect: (item: ICatalogItem) => void;
}

const CATEGORIES: { value: CatalogCategory; label: string }[] = [
  { value: 'panels', label: 'Panels' },
  { value: 'lights', label: 'Lights' },
  { value: 'cove', label: 'Cove' },
  { value: 'bidding', label: 'Bidding' },
  { value: 'artwork', label: 'Artwork' },
  { value: 'other', label: 'Other' },
];

export const CatalogSidebar: React.FC<ICatalogSidebarProps> = ({
  catalogItems,
  isCollapsed,
  onToggleCollapse,
  onDragStart,
  onItemSelect,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CatalogCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedItemIndex, setFocusedItemIndex] = useState<number>(-1);
  const catalogGridRef = useRef<HTMLDivElement>(null);

  // Filter catalog items based on category and search query
  const filteredItems = useMemo(() => {
    let items = catalogItems;

    // Filter by category
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return items;
  }, [catalogItems, selectedCategory, searchQuery]);

  // Keyboard navigation for catalog items
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isCollapsed || filteredItems.length === 0) return;

      // Arrow key navigation
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setFocusedItemIndex(prev => 
          prev < filteredItems.length - 1 ? prev + 1 : prev
        );
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setFocusedItemIndex(prev => prev > 0 ? prev - 1 : prev);
      } else if (event.key === 'Enter' && focusedItemIndex >= 0) {
        event.preventDefault();
        onItemSelect(filteredItems[focusedItemIndex]);
      }
    };

    if (catalogGridRef.current?.contains(document.activeElement)) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isCollapsed, filteredItems, focusedItemIndex, onItemSelect]);

  // Reset focused index when filters change
  useEffect(() => {
    setFocusedItemIndex(-1);
  }, [selectedCategory, searchQuery]);

  return (
    <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      {/* Collapse/Expand Button */}
      <button
        className={styles.collapseButton}
        onClick={onToggleCollapse}
        aria-label={isCollapsed ? 'Expand catalog' : 'Collapse catalog'}
        aria-expanded={!isCollapsed}
      >
        {isCollapsed ? '→' : '←'}
      </button>

      {!isCollapsed && (
        <>
          {/* Header */}
          <div className={styles.header}>
            <h2 className={styles.title}>Catalog</h2>
          </div>

          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search by name or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search catalog items"
            />
            {searchQuery && (
              <button
                className={styles.clearButton}
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className={styles.categoryFilter}>
            <button
              className={`${styles.categoryButton} ${selectedCategory === 'all' ? styles.active : ''}`}
              onClick={() => setSelectedCategory('all')}
              aria-label="Show all categories"
              aria-pressed={selectedCategory === 'all'}
            >
              All
            </button>
            {CATEGORIES.map(({ value, label }) => (
              <button
                key={value}
                className={`${styles.categoryButton} ${selectedCategory === value ? styles.active : ''}`}
                onClick={() => setSelectedCategory(value)}
                aria-label={`Filter by ${label}`}
                aria-pressed={selectedCategory === value}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Catalog Grid */}
          <div className={styles.catalogGrid} ref={catalogGridRef} role="list" aria-label="Catalog items">
            {filteredItems.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No items found</p>
                {searchQuery && (
                  <button
                    className={styles.clearSearchButton}
                    onClick={() => setSearchQuery('')}
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              filteredItems.map((item, index) => (
                <CatalogItemCard
                  key={item.id}
                  item={item}
                  onDragStart={onDragStart}
                  onTap={onItemSelect}
                  isFocused={index === focusedItemIndex}
                  onFocus={() => setFocusedItemIndex(index)}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};
