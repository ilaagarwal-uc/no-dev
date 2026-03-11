import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IModelGenerationState, IJobStatus } from './interface.js';
import { ProgressSection } from './ProgressSection.js';
import { ModelViewer } from './ModelViewer.js';
import { ErrorDisplay } from './ErrorDisplay.js';
import { CatalogPanel } from './CatalogPanel.js';
import { generateModelApi } from '../../../data-service/application/model-generation/generate_model.api.js';
import { getJobStatusApi } from '../../../data-service/application/model-generation/get_job_status.api.js';
import { getModelApi } from '../../../data-service/application/model-generation/get_model.api.js';
import { isJobComplete } from '../../../data-service/domain/model-generation/index.js';
import { POLLING_INTERVAL } from './polling_logic.js';
import styles from './model_generation_page.module.css';

export function ModelGenerationPage(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [state, setState] = useState<IModelGenerationState>({
    jobId: null,
    jobStatus: null,
    modelUrl: null,
    modelInfo: null,
    isGenerating: false,
    error: null,
    pollingInterval: null
  });
  
  // Use ref to track current jobId to avoid stale closures
  const jobIdRef = useRef<string | null>(null);
  const isGeneratingRef = useRef<boolean>(false);
  
  // Update refs when state changes
  useEffect(() => {
    jobIdRef.current = state.jobId;
    isGeneratingRef.current = state.isGenerating;
  }, [state.jobId, state.isGenerating]);
  
  // Start generation on mount
  useEffect(() => {
    startGeneration();
  }, []);
  
  // Use useCallback to memoize functions and avoid stale closures
  const pollJobStatus = useCallback(async () => {
    const currentJobId = jobIdRef.current;
    
    if (!currentJobId) {
      console.log('ModelGenerationPage: No jobId, skipping poll');
      return;
    }
    
    try {
      console.log('ModelGenerationPage: Polling job status for jobId:', currentJobId);
      const response = await getJobStatusApi(currentJobId);
      const jobStatus = response.job;
      
      console.log('ModelGenerationPage: Job status received:', {
        status: jobStatus.status,
        progress: jobStatus.progress,
        stage: jobStatus.stage,
        modelId: jobStatus.modelId
      });
      
      setState(prev => ({ ...prev, jobStatus }));
      
      // Handle completion
      if (jobStatus.status === 'completed' && jobStatus.modelId) {
        console.log('ModelGenerationPage: Job completed, loading model:', jobStatus.modelId);
        // Stop polling by setting isGenerating to false
        setState(prev => ({ ...prev, isGenerating: false }));
        await handleJobComplete(jobStatus.modelId);
        return;
      }
      
      // Handle failure
      if (jobStatus.status === 'failed') {
        console.error('ModelGenerationPage: Job failed:', jobStatus.error);
        setState(prev => ({ 
          ...prev, 
          error: jobStatus.error || 'Generation failed',
          isGenerating: false
        }));
        return;
      }
    } catch (error) {
      console.error('ModelGenerationPage: Failed to poll job status:', error);
    }
  }, []);
  
  const handleJobComplete = useCallback(async (modelId: string) => {
    try {
      console.log('ModelGenerationPage: handleJobComplete called with modelId:', modelId);
      const response = await getModelApi(modelId);
      
      console.log('ModelGenerationPage: Model loaded successfully:', {
        modelId,
        signedUrl: response.model.signedUrl,
        metadata: response.model.metadata
      });
      
      setState(prev => ({ 
        ...prev, 
        modelUrl: response.model.signedUrl,
        modelInfo: {
          vertexCount: response.model.metadata.vertexCount || 0,
          faceCount: response.model.metadata.faceCount || 0,
          fileSize: response.model.metadata.fileSize
        },
        isGenerating: false,
        // Preserve jobStatus so modelId is available for navigation
        jobStatus: prev.jobStatus ? { ...prev.jobStatus, modelId } : null
      }));
    } catch (error) {
      console.error('ModelGenerationPage: Failed to load model:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to load model',
        isGenerating: false
      }));
    }
  }, []);
  
  const startGeneration = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isGenerating: true, error: null }));
      
      // Get dimension data from location state (passed from dimension mark page)
      const { dimensionData, imageUrl, imageId } = location.state || {};
      
      if (!dimensionData || !imageUrl || !imageId) {
        throw new Error('Missing required data. Please complete dimension marking first.');
      }
      
      // Get user ID from localStorage
      const userId = localStorage.getItem('userId') || '';
      
      // Wrap dimensionData in expected format if it's an array
      const formattedDimensionData = Array.isArray(dimensionData)
        ? { elements: dimensionData }
        : dimensionData;
      
      const response = await generateModelApi({
        userId,
        imageId,
        dimensionData: formattedDimensionData,
        imageUrl
      });
      
      console.log('ModelGenerationPage: Job created:', response.jobId);
      
      setState(prev => ({ 
        ...prev, 
        jobId: response.jobId,
        isGenerating: true
      }));
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to start generation',
        isGenerating: false
      }));
    }
  }, [location.state]);
  
  // Poll job status when jobId is set and generation is active
  useEffect(() => {
    if (state.jobId && state.isGenerating) {
      console.log('ModelGenerationPage: Starting polling for jobId:', state.jobId);
      
      // Poll immediately
      pollJobStatus();
      
      // Then poll every 2 seconds
      const interval = window.setInterval(() => {
        pollJobStatus();
      }, POLLING_INTERVAL);
      
      return () => {
        console.log('ModelGenerationPage: Stopping polling');
        window.clearInterval(interval);
      };
    }
  }, [state.jobId, state.isGenerating, pollJobStatus]);
  
  const handleRetry = useCallback(() => {
    setState({
      jobId: null,
      jobStatus: null,
      modelUrl: null,
      modelInfo: null,
      isGenerating: false,
      error: null,
      pollingInterval: null
    });
    startGeneration();
  }, [startGeneration]);
  
  const handleGoBack = useCallback(() => {
    navigate('/dimension-mark');
  }, [navigate]);
  
  const handleCreateLook = useCallback(() => {
    // Extract modelId from jobStatus or derive from modelUrl
    let modelId = state.jobStatus?.modelId;
    
    // If modelId not in jobStatus, try to extract from modelUrl
    if (!modelId && state.modelUrl) {
      // modelUrl format: https://storage.googleapis.com/.../models/{modelId}.glb?...
      const urlMatch = state.modelUrl.match(/models\/([^.?]+)/);
      if (urlMatch) {
        modelId = urlMatch[1];
        console.log('ModelGenerationPage: Extracted modelId from URL:', modelId);
      }
    }
    
    console.log('ModelGenerationPage: Create Look clicked', {
      modelId,
      jobStatus: state.jobStatus,
      modelUrl: state.modelUrl
    });
    
    if (modelId) {
      console.log('ModelGenerationPage: Navigating to /create-look/' + modelId);
      navigate(`/create-look/${modelId}`);
    } else {
      console.error('ModelGenerationPage: No model ID available for Create Look navigation', {
        jobStatus: state.jobStatus,
        modelUrl: state.modelUrl
      });
      alert('Model ID not found. Please try regenerating the model.');
    }
  }, [navigate, state.jobStatus, state.modelUrl]);
  
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>3D Model Generation</h1>
      </header>
      
      <main className={styles.mainContent}>
        {state.isGenerating && !state.error && !state.modelUrl && (
          <ProgressSection jobStatus={state.jobStatus} />
        )}
        
        {state.modelUrl && !state.error && (
          <>
            <ModelViewer modelUrl={state.modelUrl} />
            <CatalogPanel />
            <div className={styles.actionButtons}>
              <button
                onClick={handleCreateLook}
                className={styles.createLookButton}
                aria-label="Create Look - Design your wall with decorative models"
              >
                Create Look
              </button>
            </div>
          </>
        )}
        
        {state.error && (
          <ErrorDisplay 
            error={state.error} 
            onRetry={handleRetry}
            onGoBack={handleGoBack}
          />
        )}
      </main>
    </div>
  );
}
