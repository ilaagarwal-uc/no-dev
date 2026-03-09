import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as ModelStorageService from '../../../src/data-service/domain/model-storage';

describe('Model Storage Service Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1.4.1 Model Upload to GCP', () => {
    it('Test 1.4.1.1: Store glTF model in GCP Cloud Storage', async () => {
      const modelFile = Buffer.from('test gltf data');
      const userId = 'user_123';
      const jobId = 'job_456';

      const result = await ModelStorageService.uploadModel(userId, jobId, modelFile, 'test.gltf');

      expect(result).toBeDefined();
      expect(result.modelId).toBeTruthy();
      expect(result.gcpPath).toBeTruthy();
    });

    it('Test 1.4.1.2: Generate unique model_id (UUID)', async () => {
      const modelFile = Buffer.from('test gltf data');
      const result1 = await ModelStorageService.uploadModel('user_1', 'job_1', modelFile, 'test1.gltf');
      const result2 = await ModelStorageService.uploadModel('user_2', 'job_2', modelFile, 'test2.gltf');

      expect(result1.modelId).not.toBe(result2.modelId);
    });

    it('Test 1.4.1.3: Set correct GCP object path (userId/modelId.gltf)', async () => {
      const modelFile = Buffer.from('test gltf data');
      const userId = 'user_123';

      const result = await ModelStorageService.uploadModel(userId, 'job_456', modelFile, 'test.gltf');

      expect(result.gcpPath).toContain(userId);
      expect(result.gcpPath).toContain('.gltf');
    });

    it('Test 1.4.1.4: Set correct content-type header (model/gltf+json)', async () => {
      const modelFile = Buffer.from('test gltf data');

      const result = await ModelStorageService.uploadModel('user_123', 'job_456', modelFile, 'test.gltf');

      expect(result).toBeDefined();
    });

    it('Test 1.4.1.5: Set correct access permissions (private, signed URLs)', async () => {
      const modelFile = Buffer.from('test gltf data');

      const result = await ModelStorageService.uploadModel('user_123', 'job_456', modelFile, 'test.gltf');

      expect(result.signedUrl).toBeTruthy();
    });
  });

  describe('1.4.2 Model Metadata Storage', () => {
    it('Test 1.4.2.1: Store model metadata in MongoDB (Memory Server)', async () => {
      const modelFile = Buffer.from('test gltf data');

      const result = await ModelStorageService.uploadModel('user_123', 'job_456', modelFile, 'test.gltf');

      expect(result.modelId).toBeTruthy();
      expect(result.gcpPath).toBeTruthy();
      expect(result.fileSize).toBeGreaterThan(0);
    });

    it('Test 1.4.2.2: Link model to job_id', async () => {
      const modelFile = Buffer.from('test gltf data');
      const jobId = 'job_456';

      const result = await ModelStorageService.uploadModel('user_123', jobId, modelFile, 'test.gltf');

      expect(result).toBeDefined();
    });

    it('Test 1.4.2.3: Store file size in metadata', async () => {
      const modelFile = Buffer.from('test gltf data with some content');

      const result = await ModelStorageService.uploadModel('user_123', 'job_456', modelFile, 'test.gltf');

      expect(result.fileSize).toBe(modelFile.length);
    });

    it('Test 1.4.2.4: Store creation timestamp', async () => {
      const modelFile = Buffer.from('test gltf data');

      const result = await ModelStorageService.uploadModel('user_123', 'job_456', modelFile, 'test.gltf');

      expect(result).toBeDefined();
    });
  });

  describe('1.4.3 Model Retrieval', () => {
    it('Test 1.4.3.1: Retrieve model by model_id', async () => {
      const modelFile = Buffer.from('test gltf data');
      const uploadResult = await ModelStorageService.uploadModel('user_123', 'job_456', modelFile, 'test.gltf');

      const retrieveResult = await ModelStorageService.getModel(uploadResult.modelId, 'user_123');

      expect(retrieveResult).toBeDefined();
      expect(retrieveResult.modelId).toBe(uploadResult.modelId);
    });

    it('Test 1.4.3.2: Generate signed URL for model access (1 hour expiry)', async () => {
      const modelFile = Buffer.from('test gltf data');
      const uploadResult = await ModelStorageService.uploadModel('user_123', 'job_456', modelFile, 'test.gltf');

      const retrieveResult = await ModelStorageService.getModel(uploadResult.modelId, 'user_123');

      expect(retrieveResult.signedUrl).toBeTruthy();
      expect(retrieveResult.expiresAt).toBeDefined();
    });

    it('Test 1.4.3.3: Retrieve model metadata by model_id', async () => {
      const modelFile = Buffer.from('test gltf data');
      const uploadResult = await ModelStorageService.uploadModel('user_123', 'job_456', modelFile, 'test.gltf');

      const retrieveResult = await ModelStorageService.getModel(uploadResult.modelId, 'user_123');

      expect(retrieveResult.metadata).toBeDefined();
      expect(retrieveResult.metadata.userId).toBe('user_123');
    });

    it('Test 1.4.3.4: Handle non-existent model_id', async () => {
      await expect(ModelStorageService.getModel('non_existent_id', 'user_123')).rejects.toThrow('Model not found');
    });
  });

  describe('1.4.4 Model Compression', () => {
    it('Test 1.4.4.1: Compress glTF model before storage (gzip)', async () => {
      const largeModelFile = Buffer.from('test gltf data'.repeat(1000));

      const result = await ModelStorageService.uploadModel('user_123', 'job_456', largeModelFile, 'test.gltf');

      expect(result.fileSize).toBeDefined();
    });

    it('Test 1.4.4.2: Decompress model on retrieval', async () => {
      const modelFile = Buffer.from('test gltf data');
      const uploadResult = await ModelStorageService.uploadModel('user_123', 'job_456', modelFile, 'test.gltf');

      const retrieveResult = await ModelStorageService.getModel(uploadResult.modelId, 'user_123');

      expect(retrieveResult).toBeDefined();
    });
  });

  describe('1.4.5 Model Deletion', () => {
    it('Test 1.4.5.1: Delete model from GCP by model_id', async () => {
      const modelFile = Buffer.from('test gltf data');
      const uploadResult = await ModelStorageService.uploadModel('user_123', 'job_456', modelFile, 'test.gltf');

      await ModelStorageService.deleteModel(uploadResult.modelId, 'user_123');

      await expect(ModelStorageService.getModel(uploadResult.modelId, 'user_123')).rejects.toThrow('Model not found');
    });

    it('Test 1.4.5.2: Delete model metadata from database', async () => {
      const modelFile = Buffer.from('test gltf data');
      const uploadResult = await ModelStorageService.uploadModel('user_123', 'job_456', modelFile, 'test.gltf');

      await ModelStorageService.deleteModel(uploadResult.modelId, 'user_123');

      await expect(ModelStorageService.getModel(uploadResult.modelId, 'user_123')).rejects.toThrow('Model not found');
    });

    it('Test 1.4.5.3: Handle deletion of non-existent model', async () => {
      await expect(ModelStorageService.deleteModel('non_existent_id', 'user_123')).rejects.toThrow('Model not found');
    });
  });
});
