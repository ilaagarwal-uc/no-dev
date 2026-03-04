// Validation functions
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\d{10}$/;
  return phoneRegex.test(phone);
}

export function validateOTP(otp: string): boolean {
  const otpRegex = /^\d{4}$/;
  return otpRegex.test(otp);
}

// Sanitization functions
export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '').slice(0, 10);
}

export function sanitizeOTP(otp: string): string {
  return otp.replace(/\D/g, '').slice(0, 4);
}

// Token management
export function storeAuthToken(token: string, userId: string): void {
  localStorage.setItem('authToken', token);
  localStorage.setItem('userId', userId);
}

export function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

export function getUserId(): string | null {
  return localStorage.getItem('userId');
}

export function clearAuthToken(): void {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userId');
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    return Date.now() >= exp;
  } catch (error) {
    return true;
  }
}
