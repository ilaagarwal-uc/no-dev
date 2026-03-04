import { loginApi, ILoginApiRequest, ILoginApiResponse } from '@data-service/application/auth';
import { validateLoginResponse, storeAuthToken } from '@data-service/domain/auth';

export interface ILoginPageRequest {
  email: string;
  password: string;
}

export interface ILoginPageResponse {
  success: boolean;
  message: string;
  userId?: string;
}

export const handleLoginPage = async (credentials: ILoginPageRequest): Promise<ILoginPageResponse> => {
  try {
    const apiRequest: ILoginApiRequest = {
      email: credentials.email,
      password: credentials.password
    };

    const response: ILoginApiResponse = await loginApi(apiRequest);

    if (validateLoginResponse(response)) {
      storeAuthToken(response.token, response.refreshToken, response.expiresIn);
      return {
        success: true,
        message: 'Login successful',
        userId: response.userId
      };
    }

    return {
      success: false,
      message: 'Login failed'
    };
  } catch (error) {
    return {
      success: false,
      message: 'An error occurred during login'
    };
  }
};
