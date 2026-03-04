// Application layer defines its own request/response types
export interface IRegisterApiRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface IRegisterApiResponse {
  success: boolean;
  userId: string;
  message: string;
}

export const handleRegister = async (data: IRegisterApiRequest): Promise<IRegisterApiResponse> => {
  // Implementation will be added
  return {
    success: false,
    userId: '',
    message: ''
  };
};
