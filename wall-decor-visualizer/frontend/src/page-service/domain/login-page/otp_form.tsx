import React, { useState, useEffect } from 'react';
import {
  validateOTP,
  sanitizeOTP,
  storeAuthToken
} from '../../../data-service/domain/auth';
import { verifyOTP, generateOTP } from '../../../data-service/application/auth';
import styles from './login_page.module.css';

interface IOTPFormProps {
  phoneNumber: string;
  onSuccess: () => void;
  onBack: () => void;
}

export function OTPForm({
  phoneNumber,
  onSuccess,
  onBack
}: IOTPFormProps): JSX.Element {
  const [otp, setOTP] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (lockedUntil && lockedUntil > 0) {
      setCountdown(lockedUntil);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setLockedUntil(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockedUntil]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOTP(sanitizeOTP(value));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateOTP(otp)) {
      setError('OTP must be exactly 4 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await verifyOTP(phoneNumber, otp);

      if (response.success && response.token && response.userId) {
        storeAuthToken(response.token, response.userId);
        onSuccess();
      } else if (response.error) {
        setError(response.error.message);
        
        if (response.error.remainingAttempts !== undefined) {
          setRemainingAttempts(response.error.remainingAttempts);
        }
        
        if (response.error.lockedUntil) {
          setLockedUntil(response.error.lockedUntil);
        }
        
        setOTP('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setLoading(true);

    try {
      const response = await generateOTP(phoneNumber);

      if (response.success) {
        setError('');
        setOTP('');
        setRemainingAttempts(null);
        setLockedUntil(null);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.infoText}>
        We've sent a 4-digit code to {phoneNumber}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="otp" className={styles.label}>
          Enter OTP
        </label>
        <input
          type="text"
          id="otp"
          value={otp}
          onChange={handleChange}
          placeholder="Enter 4-digit OTP"
          className={`${styles.input} ${styles.otpInput} ${error ? styles.inputError : ''}`}
          disabled={loading || !!lockedUntil}
          maxLength={4}
          autoFocus
        />
        {remainingAttempts !== null && remainingAttempts > 0 && (
          <p className={styles.attemptsMessage}>
            {remainingAttempts} attempts remaining
          </p>
        )}
        {error && (
          <p className={styles.errorMessage} role="alert">
            {error}
          </p>
        )}
      </div>

      {lockedUntil && countdown > 0 && (
        <div className={styles.lockoutMessage}>
          Too many failed attempts. Try again in {countdown} seconds
        </div>
      )}

      <button
        type="submit"
        className={styles.button}
        disabled={loading || !otp || !!lockedUntil}
      >
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>

      <button
        type="button"
        onClick={handleResend}
        className={styles.linkButton}
        disabled={loading}
      >
        Didn't receive the code? Resend OTP
      </button>

      <button
        type="button"
        onClick={onBack}
        className={styles.secondaryButton}
        disabled={loading}
      >
        ← Back to Phone Number
      </button>
    </form>
  );
}
