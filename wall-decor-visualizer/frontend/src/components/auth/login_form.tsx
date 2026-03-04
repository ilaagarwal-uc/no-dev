import React, { useState, useEffect } from 'react';
import styles from './login_form.module.css';

interface ILoginFormProps {
  onSendOtp: (phoneNumber: string) => Promise<void>;
  onVerifyOtp: (phoneNumber: string, otp: string) => Promise<void>;
  isLoading?: boolean;
}

interface IOtpLockout {
  isLocked: boolean;
  remainingSeconds: number;
  failedAttempts: number;
}

/**
 * LoginForm Component
 * 
 * Implements two-step authentication:
 * Step 1: Phone Number Entry → Send OTP
 * Step 2: OTP Verification → Login
 * 
 * Validation Rules:
 * - Phone: Exactly 10 digits, numeric only
 * - OTP: Exactly 4 digits, numeric only
 * - OTP Lockout: After 3 failed attempts, lock for 1 minute
 * - Auto-submit: OTP auto-submits after 4 digits entered
 */
export const LoginForm: React.FC<ILoginFormProps> = ({
  onSendOtp,
  onVerifyOtp,
  isLoading = false
}) => {
  // Form state
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');

  // Error state
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [generalError, setGeneralError] = useState('');

  // OTP lockout state (3 failed attempts = 1 minute lockout)
  const [otpLockout, setOtpLockout] = useState<IOtpLockout>({
    isLocked: false,
    remainingSeconds: 0,
    failedAttempts: 0
  });

  // Countdown timer for OTP lockout
  useEffect(() => {
    if (!otpLockout.isLocked || otpLockout.remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setOtpLockout(prev => {
        const newRemaining = prev.remainingSeconds - 1;
        if (newRemaining <= 0) {
          return { ...prev, isLocked: false, remainingSeconds: 0 };
        }
        return { ...prev, remainingSeconds: newRemaining };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [otpLockout.isLocked, otpLockout.remainingSeconds]);

  /**
   * Validation: Phone Number
   * Rules:
   * - Must be exactly 10 digits
   * - Must contain only numeric characters
   * - Cannot be empty
   */
  const validatePhoneNumber = (phone: string): { valid: boolean; error: string } => {
    const sanitized = phone.replace(/\D/g, '');

    if (!sanitized) {
      return { valid: false, error: 'Phone number is required' };
    }

    if (sanitized.length !== 10) {
      return { valid: false, error: 'Phone number must be 10 digits' };
    }

    return { valid: true, error: '' };
  };

  /**
   * Validation: OTP
   * Rules:
   * - Must be exactly 4 digits
   * - Must contain only numeric characters
   * - Cannot be empty
   */
  const validateOtp = (otpValue: string): { valid: boolean; error: string } => {
    const sanitized = otpValue.replace(/\D/g, '');

    if (!sanitized) {
      return { valid: false, error: 'OTP is required' };
    }

    if (sanitized.length !== 4) {
      return { valid: false, error: 'OTP must be 4 digits' };
    }

    return { valid: true, error: '' };
  };

  /**
   * Handle phone number input change
   * - Remove non-numeric characters
   * - Limit to 10 digits
   * - Clear errors on change
   */
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(value);
    setPhoneError('');
    setGeneralError('');
  };

  /**
   * Handle OTP input change
   * - Remove non-numeric characters
   * - Limit to 4 digits
   * - Clear errors on change
   * - Auto-submit when 4 digits entered
   */
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setOtp(value);
    setOtpError('');
    setGeneralError('');

    // Auto-submit when 4 digits entered
    if (value.length === 4) {
      handleVerifyOtp(new Event('submit') as any, value);
    }
  };

  /**
   * Handle Send OTP
   * - Validate phone number
   * - Call backend API
   * - Transition to OTP step on success
   */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    setPhoneError('');

    const validation = validatePhoneNumber(phoneNumber);
    if (!validation.valid) {
      setPhoneError(validation.error);
      return;
    }

    try {
      await onSendOtp(phoneNumber);
      setStep('otp');
      setOtp('');
      setOtpError('');
      setOtpLockout({ isLocked: false, remainingSeconds: 0, failedAttempts: 0 });
    } catch (error: any) {
      const errorMessage = error?.response?.data?.error?.message || 'Failed to send OTP. Please try again.';
      setGeneralError(errorMessage);
    }
  };

  /**
   * Handle Verify OTP
   * - Validate OTP format
   * - Check if OTP is locked (3 failed attempts)
   * - Call backend API
   * - Handle lockout on 3 failed attempts
   */
  const handleVerifyOtp = async (e: React.FormEvent | Event, otpValue?: string) => {
    if (e instanceof Event && e.type !== 'submit') {
      e.preventDefault();
    }

    setGeneralError('');
    setOtpError('');

    // Check if OTP is locked (3 failed attempts = 1 minute lockout)
    if (otpLockout.isLocked) {
      setOtpError(`Too many failed attempts. Please try again in ${otpLockout.remainingSeconds} seconds`);
      return;
    }

    const otpToVerify = otpValue || otp;
    const validation = validateOtp(otpToVerify);
    if (!validation.valid) {
      setOtpError(validation.error);
      return;
    }

    try {
      await onVerifyOtp(phoneNumber, otpToVerify);
      // Success - component will handle redirect
    } catch (error: any) {
      const errorCode = error?.response?.data?.error?.code;
      const errorMessage = error?.response?.data?.error?.message || 'Login failed. Please try again.';

      // Handle OTP lockout (3 failed attempts)
      if (errorCode === 'OTP_LOCKOUT_1_MINUTE') {
        setOtpLockout({
          isLocked: true,
          remainingSeconds: 60,
          failedAttempts: 3
        });
        setOtpError('Too many failed attempts. Please try again in 60 seconds');
      } else if (errorCode === 'INVALID_OTP') {
        // Increment failed attempts
        const newFailedAttempts = otpLockout.failedAttempts + 1;
        
        if (newFailedAttempts >= 3) {
          // Lock for 1 minute after 3 failed attempts
          setOtpLockout({
            isLocked: true,
            remainingSeconds: 60,
            failedAttempts: newFailedAttempts
          });
          setOtpError('Too many failed attempts. Please try again in 60 seconds');
        } else {
          // Show remaining attempts
          const attemptsRemaining = 3 - newFailedAttempts;
          setOtpError(`Invalid OTP. ${attemptsRemaining} attempt${attemptsRemaining > 1 ? 's' : ''} remaining`);
          setOtpLockout(prev => ({ ...prev, failedAttempts: newFailedAttempts }));
        }
      } else {
        setGeneralError(errorMessage);
      }

      // Clear OTP input on error
      setOtp('');
    }
  };

  /**
   * Handle Back to Phone
   * - Reset to phone entry step
   * - Clear OTP and errors
   * - Reset lockout state
   */
  const handleBackToPhone = () => {
    setStep('phone');
    setOtp('');
    setOtpError('');
    setGeneralError('');
    setOtpLockout({ isLocked: false, remainingSeconds: 0, failedAttempts: 0 });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Wall Decor Visualizer</h1>
        <p className={styles.subtitle}>Sign in to your account</p>
      </div>

      {generalError && <div className={styles.errorAlert}>{generalError}</div>}

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="phone" className={styles.label}>
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="Enter your 10-digit phone number"
              className={`${styles.input} ${phoneError ? styles.inputError : ''}`}
              disabled={isLoading}
              maxLength={10}
              autoFocus
            />
            {phoneError && <span className={styles.fieldError}>{phoneError}</span>}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="otp" className={styles.label}>
              Enter OTP
            </label>
            <p className={styles.otpInfo}>
              We've sent a 4-digit code to <strong>{phoneNumber}</strong>. Valid for 10 minutes.
            </p>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={handleOtpChange}
              placeholder="Enter 4-digit OTP"
              className={`${styles.input} ${otpError ? styles.inputError : ''}`}
              disabled={isLoading || otpLockout.isLocked}
              maxLength={4}
              autoFocus
            />
            {otpError && <span className={styles.fieldError}>{otpError}</span>}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading || otpLockout.isLocked}
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </button>

          <button
            type="button"
            className={styles.backButton}
            onClick={handleBackToPhone}
            disabled={isLoading}
          >
            Back to Phone Number
          </button>
        </form>
      )}

      <div className={styles.footer}>
        <span className={styles.divider}>•</span>
        <a href="/help" className={styles.link}>
          Need help?
        </a>
      </div>
    </div>
  );
};
