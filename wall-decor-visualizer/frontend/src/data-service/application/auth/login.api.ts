import axios from 'axios';

export interface ILoginApiRequest {
  email: string;
  password: string;
}

export interface ILoginApiResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  userId: string;
  expiresIn: number;
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000')
});

export const loginApi = async (credentials: ILoginApiRequest): Promise<ILoginApiResponse> => {
  const response = await apiClient.post<ILoginApiResponse>('/auth/login', credentials);
  return response.data;
};
