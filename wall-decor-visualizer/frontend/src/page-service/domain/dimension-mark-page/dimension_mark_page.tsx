import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as DimensionMarkDomain from '../../../data-service/domain/dimension-mark/index';
import * as DimensionMarkLogic from './dimension_mark_logic';
import { Canvas } from './canvas';
import { Toolbar } from './toolbar';
import { ZoomControls } from './zoom_controls';
import { ToolPanel } from './tool_panel';
import { SaveSkipButtons } from './save_skip_buttons';
import { UndoRedoButtons } from './undo_redo_buttons';
import { GlobalHeader } from './global_header';
import { IDimensionMarkPageState, IPreviewData, ToolType } from './interface';
import { getAuthToken, getUserId, clearAuthToken } from '../../../data-service/domain/auth';
import { logoutUser } from '../../application/upload';
import styles from './dimension_mark_page.module.css';

interface IDimensionMarkPageProps {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  onSave?: (annotations: DimensionMarkDomain.IAnnotation[], mergedImageBlob: Blob) => void;
  onSkip?: () => void;
}

interface IDecodedToken {
  userId: string;
  phoneNumber: string;
  exp: number;
}

export function DimensionMarkPage({
  imageUrl,
  imageWidth,
  imageHeight,
  onSave,
  onSkip
}: IDimensionMarkPageProps): JSX.Element {
  const navigate = useNavigate();
  const [state, setState] = useState<IDimensionMarkPageState>(() =>
    DimensionMarkLogic.initializeDimensionMarkPage(imageUrl, imageWidth, imageHeight)
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  // Verify authentication and get user info
  useEffect(() => {
    const token = getAuthToken();
    const storedUserId = getUserId();

    if (!token || !storedUserId) {
      navigate('/login');
      return;
    }

    try {
      const decoded = decodeToken(token);
      if (!decoded || isTokenExpired(decoded)) {
        clearAuthToken();
        navigate('/login');
        return;
      }

      setUserId(decoded.userId);
      setPhoneNumber(decoded.phoneNumber);
    } catch (error) {
      console.error('DimensionMarkPage: Error during authentication check', error);
      clearAuthToken();
      navigate('/login');
    }
  }, [navigate]);

  const decodeToken = (token: string): IDecodedToken | null => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      if (!payload.userId || !payload.phoneNumber) return null;
      
      return {
        userId: payload.userId,
        phoneNumber: payload.phoneNumber,
        exp: payload.exp
      };
    } catch (error) {
      return null;
    }
  };

  const isTokenExpired = (decoded: IDecodedToken): boolean => {
    const expiresAt = decoded.exp * 1000;
    const now = Date.now();
    return now > expiresAt;
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logoutUser();
    } catch (error) {
      // Continue with logout even if API fails
    } finally {
      clearAuthToken();
      navigate('/login');
    }
  };

  // Set canvas size
  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 100;
    }

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - 100;
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToolSelect = (tool: ToolType) => {
    setState(prev => DimensionMarkLogic.handleToolSelection(prev, tool));
  };

  const handleZoomIn = () => {
    setState(prev => DimensionMarkLogic.handleZoomIn(prev));
  };

  const handleZoomOut = () => {
    setState(prev => DimensionMarkLogic.handleZoomOut(prev));
  };

  const handlePan = (offset: DimensionMarkDomain.IPoint) => {
    setState(prev => DimensionMarkLogic.handlePan(prev, offset));
  };

  const handleAnnotationCreate = (annotation: DimensionMarkDomain.IAnnotation) => {
    setState(prev => DimensionMarkLogic.addAnnotation(prev, annotation));
  };

  const handleAnnotationUpdate = (id: string, annotation: DimensionMarkDomain.IAnnotation) => {
    setState(prev => ({
      ...prev,
      annotations: prev.annotations.map(ann => (ann.id === id ? annotation : ann))
    }));
  };

  const handleUndo = () => {
    setState(prev => DimensionMarkLogic.handleUndo(prev));
  };

  const handleRedo = () => {
    setState(prev => DimensionMarkLogic.handleRedo(prev));
  };

  const handleToolbarPositionChange = (position: DimensionMarkDomain.IPoint) => {
    setState(prev => DimensionMarkLogic.updateToolbarPosition(prev, position));
  };

  const handleArchTypeSelect = (archType: '180' | '90') => {
    setState(prev => DimensionMarkLogic.setArchType(prev, archType));
  };

  const handlePreviewUpdate = (preview: IPreviewData | undefined) => {
    setState(prev => (preview ? DimensionMarkLogic.setPreviewData(prev, preview) : DimensionMarkLogic.clearPreviewData(prev)));
  };

  const handleDrawingStart = () => {
    setState(prev => DimensionMarkLogic.setIsDrawing(prev, true));
  };

  const handleDrawingEnd = () => {
    setState(prev => DimensionMarkLogic.setIsDrawing(prev, false));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Create merged image blob
      const canvas = document.createElement('canvas');
      canvas.width = imageWidth;
      canvas.height = imageHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setIsLoading(false);
        return;
      }

      // Load and draw original image
      const img = new Image();
      img.src = imageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      ctx.drawImage(img, 0, 0);

      // Draw annotations on original image (at 100% scale)
      state.annotations.forEach(annotation => {
        drawAnnotationOnCanvas(ctx, annotation);
      });

      // Convert to blob
      canvas.toBlob(blob => {
        if (blob) {
          // Generate filename with timestamp
          const timestamp = new Date().getTime();
          const filename = `wall_image_${timestamp}.jpg`;
          
          // Download the merged image to user's device
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          
          // Store the merged image URL for next page
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64data = reader.result as string;
            sessionStorage.setItem('mergedImageData', JSON.stringify({
              imageUrl: base64data,
              imageWidth: imageWidth,
              imageHeight: imageHeight,
              filename: filename,
              hasAnnotations: true
            }));
            
            // Call onSave callback if provided
            if (onSave) {
              onSave(state.annotations, blob);
            }
            
            setIsLoading(false);
            
            // Navigate to 3D model generation page with dimension data
            const imageId = sessionStorage.getItem('uploadedImageId') || '';
            navigate('/model-generation', {
              state: {
                dimensionData: state.annotations,
                imageUrl: imageUrl, // Use original image URL, not base64
                imageId: imageId
              }
            });
          };
          reader.readAsDataURL(blob);
        } else {
          console.error('Failed to create blob');
          setIsLoading(false);
        }
      }, 'image/jpeg', 0.95);
    } catch (error) {
      console.error('Save failed:', error);
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    // Use original image only, ignore all markings/annotations
    // Store original image data for next page
    sessionStorage.setItem('mergedImageData', JSON.stringify({
      imageUrl: imageUrl,
      imageWidth: imageWidth,
      imageHeight: imageHeight,
      filename: 'original_image.jpg',
      hasAnnotations: false
    }));
    
    // Call onSkip callback if provided
    if (onSkip) {
      onSkip();
    }
    
    // Navigate to 3D model generation page with empty dimension data
    const imageId = sessionStorage.getItem('uploadedImageId') || '';
    navigate('/model-generation', {
      state: {
        dimensionData: [], // Empty annotations when skipped
        imageUrl: imageUrl, // Use original image URL
        imageId: imageId
      }
    });
  };

  return (
    <div className={styles.pageContainer}>
      {userId && phoneNumber && (
        <GlobalHeader
          userId={userId}
          phoneNumber={phoneNumber}
          onLogout={handleLogout}
        />
      )}
      
      <div className={styles.topControls}>
        <div className={styles.zoomControlsArea}>
          <ZoomControls zoomLevel={state.zoomLevel} onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
        </div>
        <div className={styles.undoRedoArea}>
          <UndoRedoButtons
            canUndo={DimensionMarkLogic.canUndo(state)}
            canRedo={DimensionMarkLogic.canRedo(state)}
            onUndo={handleUndo}
            onRedo={handleRedo}
          />
        </div>
      </div>

      <div className={styles.canvasArea}>
        <div className={styles.toolbarArea}>
          <Toolbar
            selectedTool={state.selectedTool}
            position={state.toolbarPosition}
            onToolSelect={handleToolSelect}
            onPositionChange={handleToolbarPositionChange}
          />
        </div>

        <div className={styles.toolPanelArea}>
          <ToolPanel
            selectedTool={state.selectedTool}
            archType={state.archType}
            onArchTypeSelect={handleArchTypeSelect}
          />
        </div>

        <div className={styles.buttonsArea}>
          <SaveSkipButtons onSave={handleSave} onSkip={handleSkip} isLoading={isLoading} />
        </div>

        <Canvas
          imageUrl={imageUrl}
          annotations={state.annotations}
          selectedTool={state.selectedTool}
          zoomLevel={state.zoomLevel}
          panOffset={state.panOffset}
          previewData={state.previewData}
          onAnnotationCreate={handleAnnotationCreate}
          onAnnotationUpdate={handleAnnotationUpdate}
          onDrawingStart={handleDrawingStart}
          onDrawingEnd={handleDrawingEnd}
          onPreviewUpdate={handlePreviewUpdate}
          onPanChange={handlePan}
          imageWidth={imageWidth}
          imageHeight={imageHeight}
          archType={state.archType}
        />
      </div>
    </div>
  );
}

function drawAnnotationOnCanvas(ctx: CanvasRenderingContext2D, annotation: DimensionMarkDomain.IAnnotation) {
  if (annotation.type === 'polygon') {
    const polygon = annotation.data as DimensionMarkDomain.IPolygon;
    ctx.fillStyle = polygon.fillColor;
    ctx.strokeStyle = polygon.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(polygon.vertices[0].x, polygon.vertices[0].y);
    for (let i = 1; i < polygon.vertices.length; i++) {
      ctx.lineTo(polygon.vertices[i].x, polygon.vertices[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (annotation.type === 'dimension') {
    const dimension = annotation.data as DimensionMarkDomain.IDimension;
    ctx.strokeStyle = dimension.color;
    ctx.lineWidth = 2;
    
    // Draw the main line
    ctx.beginPath();
    ctx.moveTo(dimension.startPoint.x, dimension.startPoint.y);
    ctx.lineTo(dimension.endPoint.x, dimension.endPoint.y);
    ctx.stroke();
    
    // Draw arrow heads
    const arrowSize = dimension.arrowHeadSize;
    drawArrowHeadOnCanvas(
      ctx,
      dimension.startPoint.x,
      dimension.startPoint.y,
      dimension.endPoint.x,
      dimension.endPoint.y,
      arrowSize
    );
    drawArrowHeadOnCanvas(
      ctx,
      dimension.endPoint.x,
      dimension.endPoint.y,
      dimension.startPoint.x,
      dimension.startPoint.y,
      arrowSize
    );
  } else if (annotation.type === 'freehand') {
    const freehand = annotation.data as DimensionMarkDomain.IFreehand;
    ctx.strokeStyle = freehand.color;
    ctx.lineWidth = freehand.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(freehand.points[0].x, freehand.points[0].y);
    for (let i = 1; i < freehand.points.length; i++) {
      ctx.lineTo(freehand.points[i].x, freehand.points[i].y);
    }
    ctx.stroke();
  } else if (annotation.type === 'arch') {
    const arch = annotation.data as DimensionMarkDomain.IArch;
    ctx.strokeStyle = arch.color;
    ctx.lineWidth = 2;
    const angle1 = Math.atan2(
      arch.circumferencePoints[0].y - arch.centerPoint.y,
      arch.circumferencePoints[0].x - arch.centerPoint.x
    );
    const angle2 = Math.atan2(
      arch.circumferencePoints[1].y - arch.centerPoint.y,
      arch.circumferencePoints[1].x - arch.centerPoint.x
    );
    ctx.beginPath();
    ctx.arc(arch.centerPoint.x, arch.centerPoint.y, arch.radius, angle1, angle2, false);
    ctx.stroke();
  } else if (annotation.type === 'concave') {
    const corner = annotation.data as DimensionMarkDomain.IConcaveCorner;
    ctx.fillStyle = corner.color;
    ctx.beginPath();
    ctx.arc(corner.point.x, corner.point.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = corner.strokeColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(corner.point.x, corner.point.y);
    ctx.lineTo(corner.point.x, corner.point.y + corner.size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(corner.point.x, corner.point.y);
    ctx.lineTo(corner.point.x - corner.size, corner.point.y);
    ctx.stroke();
  } else if (annotation.type === 'convex') {
    const corner = annotation.data as DimensionMarkDomain.IConvexCorner;
    ctx.fillStyle = corner.color;
    ctx.beginPath();
    ctx.arc(corner.point.x, corner.point.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = corner.strokeColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(corner.point.x, corner.point.y);
    ctx.lineTo(corner.point.x, corner.point.y - corner.size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(corner.point.x, corner.point.y);
    ctx.lineTo(corner.point.x + corner.size, corner.point.y);
    ctx.stroke();
  }
}

function drawArrowHeadOnCanvas(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  size: number
): void {
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const openAngle = (50 * Math.PI) / 180; // 50 degrees

  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(fromX - Math.cos(angle - openAngle / 2) * size, fromY - Math.sin(angle - openAngle / 2) * size);
  ctx.lineTo(fromX, fromY);
  ctx.lineTo(fromX - Math.cos(angle + openAngle / 2) * size, fromY - Math.sin(angle + openAngle / 2) * size);
  ctx.stroke();
}
