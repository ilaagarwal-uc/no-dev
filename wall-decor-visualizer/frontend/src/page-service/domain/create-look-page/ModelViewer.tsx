import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { IModelViewerProps, IModelMetadata, ICatalogItem } from './interface.js';
import { snapToGridIntersection, GRID_SPACING, calculateGridSize, snapToAngle } from './grid_utils.js';
import { 
  configureTransformControls, 
  setGridSnapping, 
  setAngleSnapping,
  getPressureSpeedMultiplier 
} from './transform_controls_config.js';
import { HapticThrottle, emitTransformChange } from './position_manipulation.js';
import { constrainScaleVector } from './scale_manipulation.js';
import styles from './model_viewer.module.css';

export function ModelViewer({
  baseModelUrl,
  appliedModels,
  selectedModelId,
  showGrid,
  snapToGrid,
  viewMode,
  isReadOnly = false,
  onLoadProgress,
  onLoadComplete,
  onLoadError,
  onModelDrop,
  onModelSelect,
  onModelTransform
}: IModelViewerProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);
  const transformControlsRef = useRef<TransformControls | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const baseModelRef = useRef<THREE.Object3D | null>(null);
  const appliedModelsMapRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const animationFrameRef = useRef<number | null>(null);
  const dropZoneMarkerRef = useRef<THREE.Mesh | null>(null);
  const isDraggingRef = useRef<boolean>(false);
  const draggedItemRef = useRef<ICatalogItem | null>(null);
  const penPressureRef = useRef<number>(0.5); // Default pressure
  const hapticThrottleRef = useRef<HapticThrottle>(new HapticThrottle());
  const isManipulatingRef = useRef<boolean>(false);
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [dropZoneValid, setDropZoneValid] = useState<boolean>(false);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current || isInitialized) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(5, 5, 5);
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create OrbitControls
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControlsRef.current = orbitControls;

    // Create TransformControls
    const transformControls = new TransformControls(camera, renderer.domElement);
    
    // Configure with 44x44px touch targets for pen/tablet
    configureTransformControls(transformControls);
    
    // Disable OrbitControls when dragging with TransformControls
    transformControls.addEventListener('dragging-changed', (event) => {
      orbitControls.enabled = !event.value;
      
      if (event.value) {
        // Start of manipulation
        isManipulatingRef.current = true;
        hapticThrottleRef.current.reset();
        
        // Provide start haptic feedback (30ms)
        if (navigator.vibrate) {
          navigator.vibrate(30);
        }
      } else {
        // End of manipulation
        isManipulatingRef.current = false;
        
        // Provide end haptic feedback (50ms)
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }
    });
    
    // Handle transform changes
    transformControls.addEventListener('change', () => {
      if (transformControls.object && selectedModelId) {
        const obj = transformControls.object;
        
        // Apply scale constraints if in scale mode
        if (transformControls.mode === 'scale') {
          const constrainedScale = constrainScaleVector(obj.scale);
          obj.scale.copy(constrainedScale);
        }
        
        // Provide subtle haptic feedback during manipulation (throttled)
        if (isManipulatingRef.current) {
          hapticThrottleRef.current.trigger();
        }
        
        onModelTransform(selectedModelId, {
          position: { x: obj.position.x, y: obj.position.y, z: obj.position.z },
          rotation: { 
            x: THREE.MathUtils.radToDeg(obj.rotation.x), 
            y: THREE.MathUtils.radToDeg(obj.rotation.y), 
            z: THREE.MathUtils.radToDeg(obj.rotation.z) 
          },
          scale: { x: obj.scale.x, y: obj.scale.y, z: obj.scale.z }
        });
      }
    });
    
    scene.add(transformControls);
    transformControlsRef.current = transformControls;

    // Create drop zone marker (circle that shows where model will be placed)
    const markerGeometry = new THREE.CircleGeometry(0.2, 32);
    const markerMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x00ff00, 
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5
    });
    const dropZoneMarker = new THREE.Mesh(markerGeometry, markerMaterial);
    dropZoneMarker.visible = false;
    dropZoneMarker.rotation.x = -Math.PI / 2; // Lay flat
    scene.add(dropZoneMarker);
    dropZoneMarkerRef.current = dropZoneMarker;

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      orbitControls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    setIsInitialized(true);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (renderer) {
        renderer.dispose();
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Load base model
  useEffect(() => {
    if (!isInitialized || !sceneRef.current || !baseModelUrl) return;

    const loader = new GLTFLoader();
    onLoadProgress(10, 'Loading base model...');

    loader.load(
      baseModelUrl,
      (gltf) => {
        const model = gltf.scene;
        baseModelRef.current = model;
        sceneRef.current!.add(model);

        // Calculate bounding box
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Center the model
        model.position.sub(center);

        // Create grid based on model size
        createGrid(size);

        // Calculate metadata
        let vertexCount = 0;
        let faceCount = 0;
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const geometry = child.geometry;
            if (geometry.attributes.position) {
              vertexCount += geometry.attributes.position.count;
            }
            if (geometry.index) {
              faceCount += geometry.index.count / 3;
            }
          }
        });

        const metadata: IModelMetadata = {
          vertexCount,
          faceCount,
          fileSize: 0,
          boundingBox: {
            min: { x: box.min.x, y: box.min.y, z: box.min.z },
            max: { x: box.max.x, y: box.max.y, z: box.max.z }
          }
        };

        onLoadProgress(100, 'Complete');
        onLoadComplete(metadata);
      },
      (progress) => {
        const percent = (progress.loaded / progress.total) * 100;
        onLoadProgress(Math.min(percent, 90), 'Loading base model...');
      },
      (error) => {
        console.error('Error loading base model:', error);
        onLoadError('Failed to load base model');
      }
    );
  }, [isInitialized, baseModelUrl]);

  // Create grid helper
  const createGrid = (modelSize: THREE.Vector3) => {
    if (!sceneRef.current) return;

    // Remove existing grid
    if (gridHelperRef.current) {
      sceneRef.current.remove(gridHelperRef.current);
      gridHelperRef.current.geometry.dispose();
      (gridHelperRef.current.material as THREE.Material).dispose();
    }

    // Calculate grid size based on model bounding box
    const { gridSize, divisions } = calculateGridSize(modelSize, GRID_SPACING);

    // Create grid helper
    const gridHelper = new THREE.GridHelper(
      gridSize,
      divisions,
      0x888888,
      0xcccccc
    );
    gridHelper.visible = showGrid;
    gridHelperRef.current = gridHelper;
    sceneRef.current.add(gridHelper);
  };

  // Toggle grid visibility
  useEffect(() => {
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = showGrid;
    }
  }, [showGrid]);

  // Update snapping settings
  useEffect(() => {
    if (transformControlsRef.current) {
      setGridSnapping(transformControlsRef.current, snapToGrid, GRID_SPACING);
      setAngleSnapping(transformControlsRef.current, snapToGrid); // Use same toggle for angle snapping
    }
  }, [snapToGrid]);

  // Track pen pressure for manipulation
  useEffect(() => {
    if (!rendererRef.current) return;

    const handlePointerMove = (event: PointerEvent) => {
      // Update pen pressure
      if (event.pointerType === 'pen') {
        penPressureRef.current = event.pressure;
      }
    };

    const canvas = rendererRef.current.domElement;
    canvas.addEventListener('pointermove', handlePointerMove);

    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  // Update view mode
  useEffect(() => {
    if (!cameraRef.current) return;

    const camera = cameraRef.current;
    
    switch (viewMode) {
      case 'orthographic':
        // Switch to orthographic camera (simplified for now)
        console.log('Orthographic view mode');
        break;
      case 'wireframe':
        // Enable wireframe mode
        if (sceneRef.current) {
          sceneRef.current.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              (child.material as THREE.MeshStandardMaterial).wireframe = true;
            }
          });
        }
        break;
      case 'perspective':
      default:
        // Disable wireframe mode
        if (sceneRef.current) {
          sceneRef.current.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              (child.material as THREE.MeshStandardMaterial).wireframe = false;
            }
          });
        }
        break;
    }
  }, [viewMode]);

  // Handle model selection
  useEffect(() => {
    if (!transformControlsRef.current) return;

    if (selectedModelId) {
      const modelObject = appliedModelsMapRef.current.get(selectedModelId);
      if (modelObject) {
        transformControlsRef.current.attach(modelObject);
      }
    } else {
      transformControlsRef.current.detach();
    }
  }, [selectedModelId]);

  // Handle click for selection
  useEffect(() => {
    if (!rendererRef.current || !cameraRef.current || !sceneRef.current) return;

    const handleClick = (event: MouseEvent) => {
      const rect = rendererRef.current!.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      raycasterRef.current.setFromCamera(mouse, cameraRef.current!);
      
      // Check for intersections with applied models
      const appliedObjects = Array.from(appliedModelsMapRef.current.values());
      const intersects = raycasterRef.current.intersectObjects(appliedObjects, true);

      if (intersects.length > 0) {
        // Find the top-level applied model
        let selectedObject = intersects[0].object;
        while (selectedObject.parent && !appliedModelsMapRef.current.has(selectedObject.userData.modelId)) {
          selectedObject = selectedObject.parent;
        }
        
        if (selectedObject.userData.modelId) {
          onModelSelect(selectedObject.userData.modelId);
        }
      } else {
        // Clicked on empty space - deselect
        onModelSelect(null);
      }
    };

    const canvas = rendererRef.current.domElement;
    canvas.addEventListener('click', handleClick);

    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  }, [onModelSelect]);

  // Handle drag over for drop zone detection
  useEffect(() => {
    if (!rendererRef.current || !cameraRef.current || !sceneRef.current || !baseModelRef.current) return;

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDraggingRef.current || !draggedItemRef.current) return;

      const rect = rendererRef.current!.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      raycasterRef.current.setFromCamera(mouse, cameraRef.current!);
      
      // Check for intersections with base model
      const intersects = raycasterRef.current.intersectObject(baseModelRef.current!, true);

      if (intersects.length > 0 && dropZoneMarkerRef.current) {
        // Valid drop zone
        const point = intersects[0].point;
        const normal = intersects[0].face?.normal;

        // Position the drop zone marker
        dropZoneMarkerRef.current.position.copy(point);
        
        // Orient marker to surface normal
        if (normal) {
          const normalWorld = normal.clone().transformDirection(intersects[0].object.matrixWorld);
          dropZoneMarkerRef.current.lookAt(point.clone().add(normalWorld));
        }

        // Show marker in green (valid)
        dropZoneMarkerRef.current.visible = true;
        (dropZoneMarkerRef.current.material as THREE.MeshBasicMaterial).color.setHex(0x00ff00);
        setDropZoneValid(true);

        // Provide haptic feedback
        if (navigator.vibrate && event.pointerType === 'pen') {
          navigator.vibrate(20);
        }
      } else if (dropZoneMarkerRef.current) {
        // Invalid drop zone - show marker in red
        dropZoneMarkerRef.current.visible = true;
        (dropZoneMarkerRef.current.material as THREE.MeshBasicMaterial).color.setHex(0xff0000);
        setDropZoneValid(false);
      }
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!isDraggingRef.current || !draggedItemRef.current) return;

      if (dropZoneValid && dropZoneMarkerRef.current && dropZoneMarkerRef.current.visible) {
        // Valid drop - get position and snap to grid if enabled
        let position = dropZoneMarkerRef.current.position.clone();
        
        if (snapToGrid) {
          position = snapToGridIntersection(position, GRID_SPACING);
        }
        
        onModelDrop(draggedItemRef.current, position);

        // Provide success haptic feedback
        if (navigator.vibrate && event.pointerType === 'pen') {
          navigator.vibrate([50, 50, 50]);
        }
      } else {
        // Invalid drop - provide error haptic feedback
        if (navigator.vibrate && event.pointerType === 'pen') {
          navigator.vibrate([100, 50, 100]);
        }
      }

      // Reset drag state
      isDraggingRef.current = false;
      draggedItemRef.current = null;
      if (dropZoneMarkerRef.current) {
        dropZoneMarkerRef.current.visible = false;
      }
      setDropZoneValid(false);
    };

    const canvas = rendererRef.current.domElement;
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dropZoneValid, onModelDrop]);

  // Expose method to start drag operation (called from parent)
  useEffect(() => {
    const handleDragStart = (event: CustomEvent) => {
      isDraggingRef.current = true;
      draggedItemRef.current = event.detail.item;
    };

    window.addEventListener('catalog-drag-start' as any, handleDragStart);

    return () => {
      window.removeEventListener('catalog-drag-start' as any, handleDragStart);
    };
  }, []);

  // Load and render applied models
  useEffect(() => {
    if (!isInitialized || !sceneRef.current) return;

    const loader = new GLTFLoader();
    const scene = sceneRef.current;

    // Get current model IDs
    const currentModelIds = new Set(appliedModels.map(m => m.id));
    const existingModelIds = new Set(appliedModelsMapRef.current.keys());

    // Remove models that are no longer in appliedModels
    for (const id of existingModelIds) {
      if (!currentModelIds.has(id)) {
        const modelObject = appliedModelsMapRef.current.get(id);
        if (modelObject) {
          scene.remove(modelObject);
          // Dispose geometry and materials
          modelObject.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.geometry.dispose();
              if (Array.isArray(child.material)) {
                child.material.forEach(m => m.dispose());
              } else {
                child.material.dispose();
              }
            }
          });
          appliedModelsMapRef.current.delete(id);
        }
      }
    }

    // Add or update models
    appliedModels.forEach((appliedModel) => {
      const existingModel = appliedModelsMapRef.current.get(appliedModel.id);

      if (existingModel) {
        // Update existing model transform
        existingModel.position.set(
          appliedModel.position.x,
          appliedModel.position.y,
          appliedModel.position.z
        );
        existingModel.rotation.set(
          THREE.MathUtils.degToRad(appliedModel.rotation.x),
          THREE.MathUtils.degToRad(appliedModel.rotation.y),
          THREE.MathUtils.degToRad(appliedModel.rotation.z)
        );
        existingModel.scale.set(
          appliedModel.scale.x,
          appliedModel.scale.y,
          appliedModel.scale.z
        );

        // Update selection highlight
        if (appliedModel.id === selectedModelId) {
          existingModel.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              // Add selection outline (simplified - could use OutlinePass for better effect)
              (child.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(0x4444ff);
              (child.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3;
            }
          });
        } else {
          existingModel.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              (child.material as THREE.MeshStandardMaterial).emissive = new THREE.Color(0x000000);
              (child.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
            }
          });
        }
      } else {
        // Load new model
        // Find catalog item to get model URL
        const catalogItem = appliedModel.catalogItemId; // This should be looked up from catalog
        // For now, we'll need to pass catalog items or model URLs through the applied model
        // This is a simplified version - in production, you'd look up the catalog item
        
        // Placeholder: In a real implementation, you would:
        // 1. Look up the catalog item by catalogItemId
        // 2. Load the model from catalogItem.modelUrl
        // 3. Position and add to scene
        
        // For now, create a placeholder cube
        const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const material = new THREE.MeshStandardMaterial({ color: 0x4488ff });
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.set(
          appliedModel.position.x,
          appliedModel.position.y,
          appliedModel.position.z
        );
        mesh.rotation.set(
          THREE.MathUtils.degToRad(appliedModel.rotation.x),
          THREE.MathUtils.degToRad(appliedModel.rotation.y),
          THREE.MathUtils.degToRad(appliedModel.rotation.z)
        );
        mesh.scale.set(
          appliedModel.scale.x,
          appliedModel.scale.y,
          appliedModel.scale.z
        );
        
        mesh.userData.modelId = appliedModel.id;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        scene.add(mesh);
        appliedModelsMapRef.current.set(appliedModel.id, mesh);
      }
    });
  }, [appliedModels, selectedModelId, isInitialized]);

  return (
    <div ref={containerRef} className={styles.viewerContainer}>
      {!isInitialized && (
        <div className={styles.loading}>
          <p>Initializing 3D viewer...</p>
        </div>
      )}
    </div>
  );
}
