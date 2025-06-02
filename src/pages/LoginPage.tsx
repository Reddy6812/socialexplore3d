import React, { FC } from 'react';
import Login from '../components/Login';

interface LoginPageProps {
  onLogin: (email: string, password: string) => boolean;
  onSignup: (
    email: string,
    password: string,
    label: string,
    phone?: string,
    address?: string,
    role?: 'general' | 'student' | 'company'
  ) => void;
}

const LoginPage: FC<LoginPageProps> = ({ onLogin, onSignup }) => (
  <div style={{ width: '100vw', height: '100vh' }}>
    <Login onLogin={onLogin} onSignup={onSignup} />
  </div>
);

export default LoginPage; 