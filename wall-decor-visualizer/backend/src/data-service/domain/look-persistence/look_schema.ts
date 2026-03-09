import mongoose, { Schema, Document } from 'mongoose';

// Domain TypeScript Interfaces
export interface IAppliedModel {
  id: string;
  catalogItemId: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  quantity: number;
  manualQuantity: boolean;
  penPressure?: number;
  placementMethod: 'pen' | 'mouse' | 'touch';
  createdAt: string;
  updatedAt: string;
}

export interface IBOMItem {
  catalogItemId: string;
  name: string;
  category: string;
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  dimensions: { width: number; height: number; depth: number };
  instances: number;
  coverageArea: number;
}

export interface ILook {
  id: string;
  userId: string;
  name: string;
  description: string;
  baseModelId: string;
  appliedModels: IAppliedModel[];
  billOfMaterials: IBOMItem[];
  thumbnailUrl: string;
  shareLink?: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Document Interface
export interface ILookDocument extends Document {
  userId: string;
  name: string;
  description: string;
  baseModelId: string;
  appliedModels: IAppliedModel[];
  billOfMaterials: IBOMItem[];
  thumbnailUrl: string;
  shareLink?: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema
const AppliedModelSchema = new Schema({
  id: { type: String, required: true },
  catalogItemId: { type: String, required: true },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    z: { type: Number, required: true }
  },
  rotation: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    z: { type: Number, required: true }
  },
  scale: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    z: { type: Number, required: true }
  },
  quantity: { type: Number, required: true },
  manualQuantity: { type: Boolean, required: true, default: false },
  penPressure: { type: Number },
  placementMethod: { type: String, enum: ['pen', 'mouse', 'touch'], required: true },
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true }
}, { _id: false });

const BOMItemSchema = new Schema({
  catalogItemId: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  unitCost: { type: Number },
  totalCost: { type: Number },
  dimensions: {
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    depth: { type: Number, required: true }
  },
  instances: { type: Number, required: true },
  coverageArea: { type: Number, required: true }
}, { _id: false });

const LookSchema = new Schema<ILookDocument>({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true, maxlength: 100 },
  description: { type: String, maxlength: 500, default: '' },
  baseModelId: { type: String, required: true },
  appliedModels: { type: [AppliedModelSchema], default: [] },
  billOfMaterials: { type: [BOMItemSchema], default: [] },
  thumbnailUrl: { type: String, required: true },
  shareLink: { type: String },
  version: { type: Number, required: true, default: 1 },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true }
});

// Indexes
LookSchema.index({ userId: 1, createdAt: -1 }); // For listing user's looks
LookSchema.index({ shareLink: 1 }); // For accessing shared looks

// Mongoose Model
export const LookModel = mongoose.models.Look || mongoose.model<ILookDocument>('Look', LookSchema);
