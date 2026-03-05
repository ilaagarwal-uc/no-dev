import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneNumberForm } from './phone_number_form';
import { OTPForm } from './otp_form';
import styles from './login_page.module.css';

export function LoginPage(): JSX.Element {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const navigate = useNavigate();

  const handlePhoneSubmitSuccess = (phone: string) => {
    setPhoneNumber(phone);
    setStep('otp');
  };

  const handleOTPVerifySuccess = () => {
    navigate('/upload');
  };

  const handleBackToPhone = () => {
    setStep('phone');
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Wall Decor Visualizer</h1>
          <p className={styles.subtitle}>Sign in to your account</p>
        </div>

        {step === 'phone' && (
          <PhoneNumberForm
            initialPhone={phoneNumber}
            onSuccess={handlePhoneSubmitSuccess}
          />
        )}

        {step === 'otp' && (
          <OTPForm
            phoneNumber={phoneNumber}
            onSuccess={handleOTPVerifySuccess}
            onBack={handleBackToPhone}
          />
        )}
      </div>
    </div>
  );
}
