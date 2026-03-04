import React, { useState } from 'react';
import {
  validatePhoneNumber,
  sanitizePhoneNumber
} from '../../../data-service/domain/auth';
import { generateOTP } from '../../../data-service/application/auth';
import styles from './login_page.module.css';

interface IPhoneNumberFormProps {
  initialPhone?: string;
  onSuccess: (phoneNumber: string) => void;
}

export function PhoneNumberForm({
  initialPhone = '',
  onSuccess
}: IPhoneNumberFormProps): JSX.Element {
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(sanitizePhoneNumber(value));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Phone number must be exactly 10 digits');
      return;
    }

    setLoading(true);

    try {
      const response = await generateOTP(phoneNumber);

      if (response.success) {
        onSuccess(phoneNumber);
      } else {
        setError(response.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="phone-number" className={styles.label}>
          Phone Number
        </label>
        <input
          type="tel"
          id="phone-number"
          value={phoneNumber}
          onChange={handleChange}
          placeholder="Enter your 10-digit phone number"
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          disabled={loading}
          maxLength={10}
          autoFocus
        />
        {error && (
          <p className={styles.errorMessage} role="alert">
            {error}
          </p>
        )}
      </div>

      <button
        type="submit"
        className={styles.button}
        disabled={loading || !phoneNumber}
      >
        {loading ? 'Sending...' : 'Send OTP'}
      </button>
    </form>
  );
}
