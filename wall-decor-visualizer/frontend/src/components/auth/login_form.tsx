import React, { useState } from 'react';
import styles from './login_form.module.css';

interface ILoginFormProps {
  onSubmit: (phoneNumber: string, otp: string) => Promise<void>;
  isLoading?: boolean;
}

export const LoginForm: React.FC<ILoginFormProps> = ({ onSubmit, isLoading = false }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  const validateOtp = (otpValue: string): boolean => {
    return /^[0-9]{4}$/.test(otpValue);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(value);
    setPhoneError('');
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setOtp(value);
    setOtpError('');
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validatePhoneNumber(phoneNumber)) {
      setPhoneError('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      setStep('otp');
    } catch (error) {
      setGeneralError('Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateOtp(otp)) {
      setOtpError('Please enter a valid 4-digit OTP');
      return;
    }

    try {
      await onSubmit(phoneNumber, otp);
    } catch (error) {
      setGeneralError('Login failed. Please check your OTP and try again.');
    }
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setOtp('');
    setOtpError('');
    setGeneralError('');
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
              We've sent a 4-digit code to <strong>{phoneNumber}</strong>
            </p>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={handleOtpChange}
              placeholder="Enter 4-digit OTP"
              className={`${styles.input} ${otpError ? styles.inputError : ''}`}
              disabled={isLoading}
              maxLength={4}
            />
            {otpError && <span className={styles.fieldError}>{otpError}</span>}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
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
