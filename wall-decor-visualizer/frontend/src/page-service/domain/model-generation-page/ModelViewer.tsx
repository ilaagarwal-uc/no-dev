import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { IModelViewerProps } from './interface.js';
import { ViewerControls } from './ViewerControls.js';
import styles from './model_viewer.module.css';

// Half foot grid spacing in Three.js units (assuming 1 unit = 1 foot)
const GRID_SPACING = 0.5;

// Create grid texture for wall surface
function createGridTexture(width: number, height: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  const pixelsPerUnit = 100; // 100 pixels per foot
  canvas.width = Math.ceil(width * pixelsPerUnit);
  canvas.height = Math.ceil(height * pixelsPerUnit);
  
  const ctx = canvas.getContext('2d')!;
  
  // Transparent background
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Grid line style
  ctx.strokeStyle = '#4a90d9';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.7;
  
  const gridPixels = GRID_SPACING * pixelsPerUnit;
  
  // Draw vertical lines
  for (let x = 0; x <= canvas.width; x += gridPixels) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  
  // Draw horizontal lines
  for (let y = 0; y <= canvas.height; y += gridPixels) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;
  
  return texture;
}

export function ModelViewer({ modelUrl }: IModelViewerProps): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [drawMode, setDrawMode] = useState<boolean>(false);
  
  // Three.js refs
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const gridMeshRef = useRef<THREE.Mesh | null>(null);
  const originalMaterialsRef = useRef<Map<THREE.Mesh, THREE.Material | THREE.Material[]>>(new Map());
  
  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff); // Pure white background
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2; // Increase exposure for brighter rendering
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Add comprehensive lighting for bright, well-lit scene
    // Ambient light - provides base illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    // Main directional light (key light) - from top-right
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight1.position.set(5, 10, 5);
    directionalLight1.castShadow = true;
    scene.add(directionalLight1);
    
    // Fill light - from left to reduce shadows
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight2.position.set(-5, 5, 5);
    scene.add(directionalLight2);
    
    // Back light - from behind to add depth
    const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight3.position.set(0, 5, -5);
    scene.add(directionalLight3);
    
    // Hemisphere light - simulates sky and ground reflection
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xcccccc, 0.5);
    scene.add(hemisphereLight);
    
    // Create OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;
    
    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      if (cameraRef.current instanceof THREE.PerspectiveCamera) {
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      } else if (cameraRef.current instanceof THREE.OrthographicCamera) {
        const aspect = width / height;
        const frustumSize = 5;
        cameraRef.current.left = -frustumSize * aspect / 2;
        cameraRef.current.right = frustumSize * aspect / 2;
        cameraRef.current.top = frustumSize / 2;
        cameraRef.current.bottom = -frustumSize / 2;
        cameraRef.current.updateProjectionMatrix();
      }
      
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);
    
    // Load GLB model
    console.log('ModelViewer: Starting to load model from URL:', modelUrl);
    
    // Check if URL looks like a GLB file
    if (!modelUrl.toLowerCase().includes('.glb') && !modelUrl.toLowerCase().includes('.gltf')) {
      console.warn('ModelViewer: URL does not appear to be a GLB/GLTF file:', modelUrl);
      setError('Invalid model URL. Expected a .glb or .gltf file.');
      setIsLoading(false);
      return;
    }
    
    // Create a loading manager with custom request headers for authentication
    const loadingManager = new THREE.LoadingManager();
    loadingManager.setURLModifier((url) => {
      // Add auth token to the URL as a query parameter since GLTFLoader doesn't support custom headers
      const authToken = localStorage.getItem('authToken');
      if (authToken && url.includes('/api/models/')) {
        const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}token=${authToken}`;
      }
      return url;
    });
    
    const loader = new GLTFLoader(loadingManager);
    loader.load(
      modelUrl,
      (gltf) => {
        console.log('ModelViewer: Model loaded successfully', gltf);
        console.log('ModelViewer: Scene children count:', gltf.scene.children.length);
        console.log('ModelViewer: Scene structure:', gltf.scene);
        
        const model = gltf.scene;
        modelRef.current = model;
        
        // Apply bright white material to all meshes
        const whiteMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.3,
          metalness: 0.0,
          emissive: 0xffffff,
          emissiveIntensity: 0.1,
          side: THREE.DoubleSide,
          flatShading: false
        });
        
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = whiteMaterial;
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        
        // Calculate bounding box and center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        console.log('ModelViewer: Bounding box:', { center, size });
        console.log('ModelViewer: Box min:', box.min, 'max:', box.max);
        
        // Center the model
        model.position.sub(center);
        
        // Calculate vertex count and face count
        let vertexCount = 0;
        let faceCount = 0;
        
        model.traverse((child) => {
          console.log('ModelViewer: Traversing child:', child.type, child.name);
          if (child instanceof THREE.Mesh) {
            console.log('ModelViewer: Found mesh:', child.name);
            const geometry = child.geometry;
            if (geometry.attributes.position) {
              vertexCount += geometry.attributes.position.count;
              console.log('ModelViewer: Vertex count:', geometry.attributes.position.count);
            }
            if (geometry.index) {
              faceCount += geometry.index.count / 3;
              console.log('ModelViewer: Face count (indexed):', geometry.index.count / 3);
            } else if (geometry.attributes.position) {
              faceCount += geometry.attributes.position.count / 3;
              console.log('ModelViewer: Face count (non-indexed):', geometry.attributes.position.count / 3);
            }
          }
        });
        
        scene.add(model);
        console.log('ModelViewer: Model added to scene');
        console.log('ModelViewer: Scene children after add:', scene.children.length);
        
        // Create grid overlay for the wall (initially hidden)
        createWallGrid(scene, size, model);
        
        // Adjust camera to fit model
        const maxDim = Math.max(size.x, size.y, size.z);
        console.log('ModelViewer: Max dimension:', maxDim);
        
        if (maxDim > 0) {
          const fov = camera.fov * (Math.PI / 180);
          let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
          cameraZ *= 1.5; // Add some padding
          camera.position.z = cameraZ;
          console.log('ModelViewer: Camera positioned at z:', cameraZ);
        } else {
          console.warn('ModelViewer: Model has zero size, using default camera position');
          camera.position.set(0, 0, 5);
        }
        
        setIsLoading(false);
        console.log('ModelViewer: Loading complete');
      },
      (progress) => {
        console.log('ModelViewer: Loading progress:', {
          loaded: progress.loaded,
          total: progress.total,
          percentage: progress.total > 0 ? (progress.loaded / progress.total * 100).toFixed(2) + '%' : 'unknown'
        });
      },
      (err) => {
        console.error('ModelViewer: Error loading model:', err);
        console.error('ModelViewer: Model URL was:', modelUrl);
        setError('Failed to load 3D model. Please try again.');
        setIsLoading(false);
      }
    );
    
    // Cleanup
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      
      if (sceneRef.current && typeof sceneRef.current.traverse === 'function') {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
      
      if (rendererRef.current && containerRef.current && rendererRef.current.domElement.parentNode) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      
      window.removeEventListener('resize', handleResize);
    };
  }, [modelUrl]);
  
  // Create grid overlay on the wall surface
  const createWallGrid = (scene: THREE.Scene, modelSize: THREE.Vector3, model: THREE.Group) => {
    // Create grid texture
    const gridTexture = createGridTexture(modelSize.x * 1.1, modelSize.y * 1.1);
    
    // Create a plane geometry that matches the wall size
    const planeGeometry = new THREE.PlaneGeometry(modelSize.x * 1.1, modelSize.y * 1.1);
    
    // Create material with grid texture
    const gridMaterial = new THREE.MeshBasicMaterial({
      map: gridTexture,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      depthTest: true,
      depthWrite: false,
      blending: THREE.NormalBlending
    });
    
    // Create mesh
    const gridMesh = new THREE.Mesh(planeGeometry, gridMaterial);
    gridMesh.name = 'wallGrid';
    gridMesh.visible = false; // Initially hidden
    
    // Position grid slightly in front of the wall (z offset)
    gridMesh.position.copy(model.position);
    gridMesh.position.z += 0.02; // Small offset to prevent z-fighting
    
    // Add to model so it moves with the wall
    model.add(gridMesh);
    gridMeshRef.current = gridMesh;
  };
  
  // Toggle draw mode (show/hide grid)
  const handleToggleDrawMode = () => {
    setDrawMode(prev => {
      const newMode = !prev;
      if (gridMeshRef.current) {
        gridMeshRef.current.visible = newMode;
      }
      return newMode;
    });
  };
  
  const handleZoomIn = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const target = controls.target;
    
    // Calculate direction from camera to target
    const direction = new THREE.Vector3();
    direction.subVectors(camera.position, target);
    
    // Reduce distance by 20%
    direction.multiplyScalar(0.8);
    
    // Update camera position
    camera.position.copy(target).add(direction);
  };
  
  const handleZoomOut = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const target = controls.target;
    
    // Calculate direction from camera to target
    const direction = new THREE.Vector3();
    direction.subVectors(camera.position, target);
    
    // Increase distance by 20%
    direction.multiplyScalar(1.2);
    
    // Update camera position
    camera.position.copy(target).add(direction);
  };
  
  const handleReset = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    
    // Restore camera to initial position
    camera.position.set(0, 0, 5);
    camera.rotation.set(0, 0, 0);
    
    // Reset controls target to origin
    controls.target.set(0, 0, 0);
    controls.update();
  };
  
  const handleFullscreen = () => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    
    if (!document.fullscreenElement) {
      // Enter fullscreen
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };
  
  return (
    <div className={styles.viewerWrapper}>
      <div className={styles.canvas} ref={containerRef}>
        {isLoading && (
          <div className={styles.placeholder}>
            <p>Loading 3D model...</p>
          </div>
        )}
        {error && (
          <div className={styles.placeholder}>
            <p style={{ color: 'red' }}>{error}</p>
          </div>
        )}
      </div>
      
      <button
        className={`${styles.drawModeButton} ${drawMode ? styles.active : ''}`}
        onClick={handleToggleDrawMode}
        aria-label={drawMode ? 'Exit Draw Mode' : 'Enter Draw Mode'}
        aria-pressed={drawMode}
      >
        {drawMode ? '✓ Draw Mode' : '📐 Draw Mode'}
      </button>
      
      <ViewerControls 
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        onFullscreen={handleFullscreen}
      />
    </div>
  );
}
