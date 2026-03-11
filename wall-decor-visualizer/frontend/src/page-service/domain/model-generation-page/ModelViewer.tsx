import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { IModelViewerProps } from './interface.js';
import { ViewerControls } from './ViewerControls.js';
import styles from './model_viewer.module.css';

// Grid cell size in feet
const CELL_SIZE = 0.5;

// Grid shader - draws grid lines based on world position
const gridVertexShader = `
  varying vec3 vWorldPosition;
  
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const gridFragmentShader = `
  uniform vec3 uGridColor;
  uniform vec3 uBaseColor;
  uniform float uCellSize;
  uniform vec3 uBoundsMin;
  uniform float uLineWidth;
  
  varying vec3 vWorldPosition;
  
  void main() {
    // Calculate position relative to bounds minimum (bottom-left corner)
    vec3 pos = vWorldPosition - uBoundsMin;
    
    // Calculate grid lines based on cell size
    // Use fract to get position within each cell
    vec3 grid = abs(fract(pos / uCellSize - 0.5) - 0.5) / fwidth(pos / uCellSize);
    
    // Get minimum distance to grid line for each axis
    float lineX = grid.x;
    float lineY = grid.y;
    float lineZ = grid.z;
    
    // Combine - take minimum of relevant axes based on surface normal
    // For a wall, we mainly care about X and Y (front face) or Y and Z (side face)
    float line = min(min(lineX, lineY), lineZ);
    
    // Create line effect
    float lineIntensity = 1.0 - min(line, 1.0);
    
    // Mix base color with grid color
    vec3 color = mix(uBaseColor, uGridColor, lineIntensity * 0.8);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

export function ModelViewer({ modelUrl }: IModelViewerProps): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [drawMode, setDrawMode] = useState<boolean>(false);
  
  // Three.js refs
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const modelBoundsRef = useRef<THREE.Box3 | null>(null);
  
  // Material refs
  const originalMaterialsRef = useRef<Map<THREE.Mesh, THREE.Material | THREE.Material[]>>(new Map());
  const gridMaterialRef = useRef<THREE.ShaderMaterial | null>(null);


  // Create grid shader material
  const createGridMaterial = useCallback((boundsMin: THREE.Vector3) => {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uGridColor: { value: new THREE.Color(0x4A90A4) }, // Dark blue grid lines
        uBaseColor: { value: new THREE.Color(0xffffff) }, // White base
        uCellSize: { value: CELL_SIZE },
        uBoundsMin: { value: boundsMin },
        uLineWidth: { value: 0.02 },
      },
      vertexShader: gridVertexShader,
      fragmentShader: gridFragmentShader,
      side: THREE.DoubleSide,
    });
    
    gridMaterialRef.current = material;
    return material;
  }, []);

  // Toggle draw mode - swap materials
  const handleToggleDrawMode = useCallback(() => {
    setDrawMode(prev => {
      const newMode = !prev;
      
      if (!modelRef.current) return newMode;
      
      if (newMode) {
        // Create grid material if not exists
        if (!gridMaterialRef.current && modelBoundsRef.current) {
          createGridMaterial(modelBoundsRef.current.min);
        }
        
        // Store original materials and apply grid material
        modelRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            // Store original material
            if (!originalMaterialsRef.current.has(child)) {
              originalMaterialsRef.current.set(child, child.material);
            }
            // Apply grid material
            if (gridMaterialRef.current) {
              child.material = gridMaterialRef.current;
            }
          }
        });
      } else {
        // Restore original materials
        modelRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const originalMaterial = originalMaterialsRef.current.get(child);
            if (originalMaterial) {
              child.material = originalMaterial;
            }
          }
        });
      }
      
      return newMode;
    });
  }, [createGridMaterial]);


  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
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
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight1.position.set(5, 10, 5);
    directionalLight1.castShadow = true;
    scene.add(directionalLight1);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight2.position.set(-5, 5, 5);
    scene.add(directionalLight2);
    
    const directionalLight3 = new THREE.DirectionalLight(0xffffff, 0.4);
    directionalLight3.position.set(0, 5, -5);
    scene.add(directionalLight3);
    
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
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);
    
    // Load GLB model
    if (!modelUrl.toLowerCase().includes('.glb') && !modelUrl.toLowerCase().includes('.gltf')) {
      setError('Invalid model URL. Expected a .glb or .gltf file.');
      setIsLoading(false);
      return;
    }
    
    const loadingManager = new THREE.LoadingManager();
    loadingManager.setURLModifier((url) => {
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
        const model = gltf.scene;
        modelRef.current = model;
        
        // Apply white material
        const whiteMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.3,
          metalness: 0.0,
          emissive: 0xffffff,
          emissiveIntensity: 0.1,
          side: THREE.DoubleSide,
        });
        
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.material = whiteMaterial;
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
        
        // Calculate bounding box BEFORE centering
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Center the model
        model.position.sub(center);
        
        // Recalculate bounds after centering
        model.updateMatrixWorld(true);
        const centeredBox = new THREE.Box3().setFromObject(model);
        modelBoundsRef.current = centeredBox;
        
        scene.add(model);
        
        // Adjust camera
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
          const fov = camera.fov * (Math.PI / 180);
          let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
          cameraZ *= 1.5;
          camera.position.z = cameraZ;
        }
        
        setIsLoading(false);
      },
      undefined,
      (err) => {
        console.error('Error loading model:', err);
        setError('Failed to load 3D model. Please try again.');
        setIsLoading(false);
      }
    );
    
    // Cleanup
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (controlsRef.current) controlsRef.current.dispose();
      if (rendererRef.current && containerRef.current && rendererRef.current.domElement.parentNode) {
        containerRef.current.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [modelUrl]);


  const handleZoomIn = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const direction = new THREE.Vector3();
    direction.subVectors(camera.position, controls.target);
    direction.multiplyScalar(0.8);
    camera.position.copy(controls.target).add(direction);
  };

  const handleZoomOut = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const direction = new THREE.Vector3();
    direction.subVectors(camera.position, controls.target);
    direction.multiplyScalar(1.2);
    camera.position.copy(controls.target).add(direction);
  };

  const handleReset = () => {
    if (!cameraRef.current || !controlsRef.current) return;
    cameraRef.current.position.set(0, 0, 5);
    cameraRef.current.rotation.set(0, 0, 0);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
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
