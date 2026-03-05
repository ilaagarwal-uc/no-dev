import { getAuthToken, getUserId, clearAuthToken } from '../../../data-service/domain/auth';

export interface IUploadImageRequest {
  image: File;
  userId: string;
}

export interface IUploadImageResponse {
  success: true;
  imageId: string;
  gcpUrl: string;
}

export interface IUploadImageErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
  };
}

export type UploadImageApiResponse = IUploadImageResponse | IUploadImageErrorResponse;

/**
 * Decodes JWT token to extract claims
 */
function decodeToken(token: string): Record<string, any> | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Checks if token is expiring soon (within 5 minutes)
 */
function isTokenExpiringsoon(token: string): boolean {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  const expiresAt = decoded.exp * 1000; // Convert to milliseconds
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  return expiresAt - now < fiveMinutes;
}

/**
 * Refreshes the JWT token before it expires
 */
async function refreshToken(): Promise<boolean> {
  const token = getAuthToken();
  if (!token) {
    return false;
  }

  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 401) {
      // Token invalid or expired, clear and redirect to login
      clearAuthToken();
      window.location.href = '/login';
      return false;
    }

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    if (data.success && data.token) {
      // Store new token
      localStorage.setItem('authToken', data.token);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Token refresh error:', error);
    return false;
  }
}

/**
 * Handles 401 responses by clearing session and redirecting to login
 */
function handleUnauthorized(): void {
  clearAuthToken();
  window.location.href = '/login';
}

/**
 * Handles 403 responses by showing error message
 */
function handleForbidden(): string {
  return "You don't have permission to access this resource.";
}

export async function uploadImage(
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<UploadImageApiResponse> {
  console.log('uploadImage: Starting upload', { fileName: file.name, fileSize: file.size, userId });
  
  let token = getAuthToken();
  if (!token) {
    console.error('uploadImage: No auth token found');
    return {
      success: false,
      error: {
        message: 'Authentication required. Please log in.',
        code: 'UNAUTHORIZED'
      }
    };
  }

  // Check if token is expiring soon and refresh if needed
  if (isTokenExpiringsoon(token)) {
    console.log('uploadImage: Token expiring soon, refreshing...');
    const refreshed = await refreshToken();
    if (!refreshed) {
      console.error('uploadImage: Token refresh failed');
      handleUnauthorized();
      return {
        success: false,
        error: {
          message: 'Session expired. Please log in again.',
          code: 'UNAUTHORIZED'
        }
      };
    }
    token = getAuthToken() || token;
    console.log('uploadImage: Token refreshed successfully');
  }

  const formData = new FormData();
  formData.append('image', file);
  formData.append('userId', userId);

  console.log('uploadImage: Sending request to /api/images/upload');

  try {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          onProgress(percentComplete);
        }
      });
    }

    return new Promise((resolve, reject) => {
      xhr.addEventListener('load', () => {
        console.log('uploadImage: Response received', { status: xhr.status, responseText: xhr.responseText });
        
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.log('uploadImage: Upload successful', response);
            resolve(response);
          } catch (error) {
            console.error('uploadImage: Failed to parse response', error);
            resolve({
              success: false,
              error: {
                message: 'Failed to parse response',
                code: 'PARSE_ERROR'
              }
            });
          }
        } else if (xhr.status === 400) {
          try {
            const response = JSON.parse(xhr.responseText);
            console.error('uploadImage: Bad request', response);
            resolve(response);
          } catch (error) {
            console.error('uploadImage: Failed to parse error response', error);
            resolve({
              success: false,
              error: {
                message: 'Invalid request',
                code: 'INVALID_REQUEST'
              }
            });
          }
        } else if (xhr.status === 401) {
          console.error('uploadImage: Unauthorized');
          handleUnauthorized();
          resolve({
            success: false,
            error: {
              message: 'Session expired. Please log in again.',
              code: 'UNAUTHORIZED'
            }
          });
        } else if (xhr.status === 403) {
          console.error('uploadImage: Forbidden');
          resolve({
            success: false,
            error: {
              message: handleForbidden(),
              code: 'FORBIDDEN'
            }
          });
        } else if (xhr.status === 429) {
          console.error('uploadImage: Rate limit exceeded');
          resolve({
            success: false,
            error: {
              message: 'Too many uploads. Please try again later.',
              code: 'RATE_LIMIT_EXCEEDED'
            }
          });
        } else if (xhr.status >= 500) {
          console.error('uploadImage: Server error');
          resolve({
            success: false,
            error: {
              message: 'Server error. Please try again later.',
              code: 'SERVER_ERROR'
            }
          });
        } else {
          console.error('uploadImage: Upload failed with status', xhr.status);
          resolve({
            success: false,
            error: {
              message: 'Upload failed. Please try again.',
              code: 'UPLOAD_FAILED'
            }
          });
        }
      });

      xhr.addEventListener('error', () => {
        console.error('uploadImage: Network error');
        resolve({
          success: false,
          error: {
            message: 'Network error. Please check your connection.',
            code: 'NETWORK_ERROR'
          }
        });
      });

      xhr.addEventListener('abort', () => {
        console.error('uploadImage: Upload cancelled');
        resolve({
          success: false,
          error: {
            message: 'Upload cancelled.',
            code: 'UPLOAD_CANCELLED'
          }
        });
      });

      xhr.open('POST', '/api/images/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    });
  } catch (error) {
    console.error('uploadImage: Unexpected error', error);
    return {
      success: false,
      error: {
        message: 'An unexpected error occurred.',
        code: 'UNEXPECTED_ERROR'
      }
    };
  }
}

export async function logoutUser(): Promise<void> {
  const token = getAuthToken();
  if (!token) {
    return;
  }

  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    // Logout API is optional, continue with local cleanup
  }
}
