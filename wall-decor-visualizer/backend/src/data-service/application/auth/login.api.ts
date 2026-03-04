// Application layer defines its own request/response types
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

export const handleLogin = async (credentials: ILoginApiRequest): Promise<ILoginApiResponse> => {
  // Implementation will be added
  return {
    success: false,
    token: '',
    refreshToken: '',
    userId: '',
    expiresIn: 0
  };
};
