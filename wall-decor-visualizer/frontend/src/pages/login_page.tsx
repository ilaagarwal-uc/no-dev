import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '@components/auth/login_form';
import styles from './login_page.module.css';
import { handleLoginPage } from '@page-service/application/login';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await handleLoginPage({ email, password });
      if (result.success) {
        navigate('/upload');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
    </div>
  );
};
