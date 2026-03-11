import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center } from '@react-three/drei';
import { getCatalogModelsApi } from '../../../data-service/application/catalog/index.js';
import { ICatalogItem } from '../../../data-service/domain/create-look/create_look_schema.js';
import styles from './catalog_panel.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface ICatalogPanelProps {
  onItemSelect?: (item: ICatalogItem) => void;
}

// Mini 3D model preview component
function ModelPreview({ modelUrl }: { modelUrl: string }) {
  const fullUrl = `${API_BASE_URL}${modelUrl}`;
  console.log('ModelPreview: Loading model from:', fullUrl);
  const { scene } = useGLTF(fullUrl);
  console.log('ModelPreview: Model loaded successfully');
  
  return (
    <Center>
      <primitive object={scene.clone()} scale={1.5} />
    </Center>
  );
}

// Fallback for loading state
function ModelFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#e0e0e0" />
    </mesh>
  );
}

// Error boundary for 3D preview
function ModelPreviewWithFallback({ modelUrl }: { modelUrl: string }) {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (hasError) {
    console.warn('ModelPreviewWithFallback: Showing fallback due to error:', errorMessage);
    return <ModelFallback />;
  }

  return (
    <ErrorBoundary onError={(error) => {
      console.error('ModelPreviewWithFallback: Error loading model:', error);
      setErrorMessage(error?.message || 'Unknown error');
      setHasError(true);
    }}>
      <ModelPreview modelUrl={modelUrl} />
    </ErrorBoundary>
  );
}

// Simple error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error?: Error) => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: (error?: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught error:', error);
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

export function CatalogPanel({ onItemSelect }: ICatalogPanelProps): JSX.Element {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [catalogItems, setCatalogItems] = useState<ICatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const items = await getCatalogModelsApi();
      setCatalogItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load catalog');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      panels: '#4caf50',
      lights: '#ffc107',
      cove: '#2196f3',
      bidding: '#9c27b0',
      artwork: '#ff5722',
      shelf: '#795548',
    };
    return colors[category] || colors.shelf;
  };

  const handleItemClick = (item: ICatalogItem) => {
    if (onItemSelect) {
      onItemSelect(item);
    }
  };

  return (
    <div className={`${styles.catalogPanel} ${isCollapsed ? styles.collapsed : ''}`}>
      <button
        className={styles.collapseButton}
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? 'Expand catalog' : 'Collapse catalog'}
        aria-expanded={!isCollapsed}
      >
        {isCollapsed ? '←' : '→'}
      </button>

      {!isCollapsed && (
        <>
          <div className={styles.header}>
            <h2 className={styles.title}>3D Models Catalog</h2>
            <p className={styles.subtitle}>Available models to apply</p>
          </div>

          <div className={styles.catalogList} role="list" aria-label="Catalog items">
            {isLoading && (
              <div className={styles.loadingState}>
                <div className={styles.spinner} />
                <span className={styles.loadingText}>Loading catalog...</span>
              </div>
            )}

            {error && (
              <div className={styles.emptyState}>
                <p>{error}</p>
              </div>
            )}

            {!isLoading && !error && catalogItems.length === 0 && (
              <div className={styles.emptyState}>
                <p>No catalog items found</p>
              </div>
            )}

            {!isLoading && !error && catalogItems.map((item) => (
              <div
                key={item.id}
                className={styles.catalogItem}
                onClick={() => handleItemClick(item)}
                onKeyDown={(e) => e.key === 'Enter' && handleItemClick(item)}
                role="button"
                tabIndex={0}
                aria-label={`${item.name}, ${item.dimensions.width} by ${item.dimensions.height} by ${item.dimensions.depth} feet`}
              >
                <div className={styles.modelPreview}>
                  <Canvas
                    camera={{ position: [1.5, 1.5, 1.5], fov: 40 }}
                    style={{ background: '#f5f5f5' }}
                  >
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[5, 5, 5]} intensity={0.8} />
                    <Suspense fallback={<ModelFallback />}>
                      <ModelPreviewWithFallback modelUrl={item.modelUrl} />
                    </Suspense>
                    <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />
                  </Canvas>
                </div>
                <div className={styles.itemInfo}>
                  <h3 className={styles.itemName}>{item.name}</h3>
                  <p className={styles.itemDimensions}>
                    {item.dimensions.width}' × {item.dimensions.height}' × {item.dimensions.depth}'
                  </p>
                  <span
                    className={styles.itemCategory}
                    style={{ backgroundColor: getCategoryColor(item.category) }}
                  >
                    {item.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
