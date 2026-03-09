// Look persistence domain service
import { LookModel, ILook, ILookDocument } from './look_schema.js';
import { v4 as uuidv4 } from 'uuid';

export async function saveLook(
  userId: string,
  name: string,
  description: string,
  baseModelId: string,
  appliedModels: any[],
  billOfMaterials: any[],
  thumbnailUrl: string
): Promise<ILook> {
  const now = new Date();
  
  const lookDoc = new LookModel({
    userId,
    name,
    description,
    baseModelId,
    appliedModels,
    billOfMaterials,
    thumbnailUrl,
    version: 1,
    createdAt: now,
    updatedAt: now
  });
  
  await lookDoc.save();
  
  return documentToLook(lookDoc);
}

export async function updateLook(
  lookId: string,
  userId: string,
  updates: {
    name?: string;
    description?: string;
    appliedModels?: any[];
    billOfMaterials?: any[];
    thumbnailUrl?: string;
  }
): Promise<ILook> {
  const lookDoc = await LookModel.findById(lookId);
  
  if (!lookDoc) {
    throw new Error(`Look not found: ${lookId}`);
  }
  
  if (lookDoc.userId !== userId) {
    throw new Error('Unauthorized: Cannot update look owned by another user');
  }
  
  // Update fields
  if (updates.name !== undefined) lookDoc.name = updates.name;
  if (updates.description !== undefined) lookDoc.description = updates.description;
  if (updates.appliedModels !== undefined) lookDoc.appliedModels = updates.appliedModels;
  if (updates.billOfMaterials !== undefined) lookDoc.billOfMaterials = updates.billOfMaterials;
  if (updates.thumbnailUrl !== undefined) lookDoc.thumbnailUrl = updates.thumbnailUrl;
  
  // Increment version
  lookDoc.version += 1;
  lookDoc.updatedAt = new Date();
  
  await lookDoc.save();
  
  return documentToLook(lookDoc);
}

export async function getLook(lookId: string, userId: string): Promise<ILook> {
  const lookDoc = await LookModel.findById(lookId);
  
  if (!lookDoc) {
    throw new Error(`Look not found: ${lookId}`);
  }
  
  if (lookDoc.userId !== userId) {
    throw new Error('Unauthorized: Cannot access look owned by another user');
  }
  
  return documentToLook(lookDoc);
}

export async function getLookByShareLink(shareLink: string): Promise<ILook> {
  const lookDoc = await LookModel.findOne({ shareLink });
  
  if (!lookDoc) {
    throw new Error(`Look not found with share link: ${shareLink}`);
  }
  
  return documentToLook(lookDoc);
}

export async function listUserLooks(userId: string): Promise<ILook[]> {
  const lookDocs = await LookModel.find({ userId })
    .sort({ createdAt: -1 })
    .exec();
  
  return lookDocs.map(documentToLook);
}

export async function deleteLook(lookId: string, userId: string): Promise<void> {
  const lookDoc = await LookModel.findById(lookId);
  
  if (!lookDoc) {
    throw new Error(`Look not found: ${lookId}`);
  }
  
  if (lookDoc.userId !== userId) {
    throw new Error('Unauthorized: Cannot delete look owned by another user');
  }
  
  await LookModel.findByIdAndDelete(lookId);
}

export async function generateShareLink(lookId: string, userId: string): Promise<string> {
  const lookDoc = await LookModel.findById(lookId);
  
  if (!lookDoc) {
    throw new Error(`Look not found: ${lookId}`);
  }
  
  if (lookDoc.userId !== userId) {
    throw new Error('Unauthorized: Cannot share look owned by another user');
  }
  
  // Generate unique share link if not already exists
  if (!lookDoc.shareLink) {
    const shareToken = uuidv4();
    lookDoc.shareLink = shareToken;
    await lookDoc.save();
  }
  
  return lookDoc.shareLink;
}

// Helper function to convert Mongoose document to domain interface
function documentToLook(doc: ILookDocument): ILook {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    name: doc.name,
    description: doc.description,
    baseModelId: doc.baseModelId,
    appliedModels: doc.appliedModels,
    billOfMaterials: doc.billOfMaterials,
    thumbnailUrl: doc.thumbnailUrl,
    shareLink: doc.shareLink,
    version: doc.version,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
}

export type { ILook, IAppliedModel, IBOMItem } from './look_schema.js';
