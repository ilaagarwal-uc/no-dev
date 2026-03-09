/**
 * Drag handler for pen/tablet optimized drag-and-drop
 */

import * as THREE from 'three';
import { ICatalogItem } from './interface.js';

export interface IDragState {
  isDragging: boolean;
  draggedItem: ICatalogItem | null;
  ghostPosition: { x: number; y: number };
  isValidDropZone: boolean;
  dropPosition: THREE.Vector3 | null;
  dropNormal: THREE.Vector3 | null;
  pressure: number;
}

export interface IDragHandlerCallbacks {
  onDragStart: (item: ICatalogItem, position: { x: number; y: number }) => void;
  onDragMove: (position: { x: number; y: number }, isValid: boolean, pressure: number) => void;
  onDragEnd: (item: ICatalogItem, dropPosition: THREE.Vector3, dropNormal: THREE.Vector3) => void;
  onDragCancel: (item: ICatalogItem, returnPosition: { x: number; y: number }) => void;
}

const HOLD_DURATION = 500; // 500ms hold to initiate drag
const HAPTIC_ENTER_ZONE = 20; // 20ms vibration when entering valid zone
const HAPTIC_DRAG_START = 50; // 50ms vibration on drag start
const HAPTIC_SUCCESS = [50, 50, 50]; // Triple vibration on success
const HAPTIC_ERROR = [100, 50, 100]; // Error pattern

export class DragHandler {
  private holdTimer: number | null = null;
  private isDragging = false;
  private draggedItem: ICatalogItem | null = null;
  private dragStartPosition: { x: number; y: number } = { x: 0, y: 0 };
  private lastHapticTime = 0;
  private wasInValidZone = false;

  constructor(
    private raycaster: THREE.Raycaster,
    private camera: THREE.Camera,
    private baseModel: THREE.Object3D,
    private canvas: HTMLCanvasElement,
    private callbacks: IDragHandlerCallbacks
  ) {}

  /**
   * Handle pen/pointer down event - start hold timer
   */
  public handlePointerDown(event: PointerEvent, item: ICatalogItem): void {
    // Only support pen and touch input
    if (event.pointerType !== 'pen' && event.pointerType !== 'touch') {
      return;
    }

    // Clear any existing timer
    if (this.holdTimer !== null) {
      clearTimeout(this.holdTimer);
    }

    // Start hold timer (500ms)
    this.holdTimer = window.setTimeout(() => {
      this.startDrag(event, item);
    }, HOLD_DURATION);
  }

  /**
   * Handle pointer move - cancel hold if moved too much, or update drag position
   */
  public handlePointerMove(event: PointerEvent): void {
    if (this.isDragging && this.draggedItem) {
      this.updateDrag(event);
    } else if (this.holdTimer !== null) {
      // If moved during hold, cancel the hold timer
      // (optional: could add threshold for movement)
      // For now, we'll allow small movements during hold
    }
  }

  /**
   * Handle pointer up - complete drag or cancel hold
   */
  public handlePointerUp(event: PointerEvent): void {
    // Clear hold timer if still waiting
    if (this.holdTimer !== null) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }

    // If dragging, complete the drag
    if (this.isDragging && this.draggedItem) {
      this.completeDrag(event);
    }
  }

  /**
   * Handle pointer cancel - cancel drag
   */
  public handlePointerCancel(): void {
    if (this.holdTimer !== null) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }

    if (this.isDragging) {
      this.cancelDrag();
    }
  }

  /**
   * Start drag operation
   */
  private startDrag(event: PointerEvent, item: ICatalogItem): void {
    this.isDragging = true;
    this.draggedItem = item;
    this.dragStartPosition = { x: event.clientX, y: event.clientY };
    this.holdTimer = null;

    // Provide haptic feedback
    this.vibrate(HAPTIC_DRAG_START, event.pointerType);

    // Notify callback
    this.callbacks.onDragStart(item, {
      x: event.clientX,
      y: event.clientY
    });
  }

  /**
   * Update drag position and detect drop zone
   */
  private updateDrag(event: PointerEvent): void {
    if (!this.draggedItem) return;

    const rect = this.canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    // Raycast to detect drop zone
    this.raycaster.setFromCamera(mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.baseModel, true);

    const isValid = intersects.length > 0;
    const pressure = event.pressure || 1.0;

    // Provide haptic feedback when entering valid zone
    if (isValid && !this.wasInValidZone) {
      this.vibrate(HAPTIC_ENTER_ZONE, event.pointerType);
      this.wasInValidZone = true;
    } else if (!isValid && this.wasInValidZone) {
      this.wasInValidZone = false;
    }

    // Notify callback with ghost position
    this.callbacks.onDragMove(
      { x: event.clientX, y: event.clientY },
      isValid,
      pressure
    );
  }

  /**
   * Complete drag operation
   */
  private completeDrag(event: PointerEvent): void {
    if (!this.draggedItem) return;

    const rect = this.canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    // Raycast to get final drop position
    this.raycaster.setFromCamera(mouse, this.camera);
    const intersects = this.raycaster.intersectObject(this.baseModel, true);

    if (intersects.length > 0) {
      // Valid drop
      const dropPoint = intersects[0].point;
      const dropNormal = intersects[0].face?.normal || new THREE.Vector3(0, 1, 0);
      
      // Transform normal to world space
      const normalWorld = dropNormal.clone().transformDirection(intersects[0].object.matrixWorld);

      // Provide success haptic feedback
      this.vibrate(HAPTIC_SUCCESS, event.pointerType);

      // Notify callback
      this.callbacks.onDragEnd(this.draggedItem, dropPoint, normalWorld);
    } else {
      // Invalid drop - animate back to catalog
      this.vibrate(HAPTIC_ERROR, event.pointerType);
      this.callbacks.onDragCancel(this.draggedItem, this.dragStartPosition);
    }

    // Reset state
    this.isDragging = false;
    this.draggedItem = null;
    this.wasInValidZone = false;
  }

  /**
   * Cancel drag operation
   */
  private cancelDrag(): void {
    if (this.draggedItem) {
      this.callbacks.onDragCancel(this.draggedItem, this.dragStartPosition);
    }
    this.isDragging = false;
    this.draggedItem = null;
    this.wasInValidZone = false;
  }

  /**
   * Provide haptic feedback
   */
  private vibrate(pattern: number | number[], pointerType: string): void {
    if (navigator.vibrate && pointerType === 'pen') {
      const now = Date.now();
      // Throttle haptic feedback to avoid overwhelming
      if (now - this.lastHapticTime > 50) {
        navigator.vibrate(pattern);
        this.lastHapticTime = now;
      }
    }
  }

  /**
   * Get current drag state
   */
  public getDragState(): { isDragging: boolean; draggedItem: ICatalogItem | null } {
    return {
      isDragging: this.isDragging,
      draggedItem: this.draggedItem
    };
  }

  /**
   * Cleanup
   */
  public dispose(): void {
    if (this.holdTimer !== null) {
      clearTimeout(this.holdTimer);
      this.holdTimer = null;
    }
    this.isDragging = false;
    this.draggedItem = null;
  }
}
