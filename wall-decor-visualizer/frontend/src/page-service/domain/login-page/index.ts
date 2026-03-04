export interface ILoginFormState {
  phoneNumber: string;
  error: string;
  loading: boolean;
}

export interface IOTPFormState {
  otp: string;
  error: string;
  loading: boolean;
  remainingAttempts: number | null;
  lockedUntil: number | null;
}

export function initializeLoginForm(): ILoginFormState {
  return {
    phoneNumber: '',
    error: '',
    loading: false
  };
}

export function initializeOTPForm(): IOTPFormState {
  return {
    otp: '',
    error: '',
    loading: false,
    remainingAttempts: null,
    lockedUntil: null
  };
}

export function calculateRemainingLockoutTime(lockedUntil: number): number {
  return Math.max(0, lockedUntil);
}

export function shouldShowCountdown(failedAttempts: number): boolean {
  return failedAttempts >= 3;
}

export function formatPhoneNumber(phone: string): string {
  if (phone.length === 10) {
    return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6)}`;
  }
  return phone;
}
