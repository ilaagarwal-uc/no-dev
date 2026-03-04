import React from 'react';
import { clearAuthToken } from '../../../data-service/domain/auth';
import { useNavigate } from 'react-router-dom';

export function Dashboard(): JSX.Element {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthToken();
    navigate('/login');
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Dashboard</h1>
      <p>Welcome! You are successfully logged in.</p>
      <button
        onClick={handleLogout}
        style={{
          marginTop: '1rem',
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#97B3AE',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </div>
  );
}
