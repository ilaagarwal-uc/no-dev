/**
 * Catalog Schema
 * Database schema for catalog items
 */

import mongoose, { Schema, Document } from 'mongoose';

export interface ICatalogItemDocument extends Document {
  modelId: string;
  name: string;
  description: string;
  category: 'panels' | 'lights' | 'cove' | 'bidding' | 'artwork' | 'other';
  dimensions: {
    width: number;  // In feet
    height: number; // In feet
    depth: number;  // In feet
  };
  unitCost?: number;
  fileName: string;
  filePath: string;
  thumbnailPath?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // Admin user ID
}

const catalogItemSchema = new Schema<ICatalogItemDocument>(
  {
    modelId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      enum: ['panels', 'lights', 'cove', 'bidding', 'artwork', 'other'],
      required: true
    },
    dimensions: {
      width: {
        type: Number,
        required: true,
        min: 0
      },
      height: {
        type: Number,
        required: true,
        min: 0
      },
      depth: {
        type: Number,
        required: true,
        min: 0
      }
    },
    unitCost: {
      type: Number,
      min: 0
    },
    fileName: {
      type: String,
      required: true
    },
    filePath: {
      type: String,
      required: true
    },
    thumbnailPath: {
      type: String
    },
    tags: {
      type: [String],
      default: []
    },
    createdBy: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export const CatalogItem = mongoose.model<ICatalogItemDocument>('CatalogItem', catalogItemSchema);
