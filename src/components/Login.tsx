import React, { FC, useState } from 'react';
import IntroScene from './IntroScene';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const LoginContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f2f5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
`;

const Button = styled.button`
  padding: 8px;
  background: #00aaff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
`;

interface LoginProps {
  onLogin: (email: string, password: string) => boolean;
  onSignup: (email: string, password: string, label: string, phone?: string, address?: string) => void;
}

const Login: FC<LoginProps> = ({ onLogin, onSignup }) => {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupLabel, setSignupLabel] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupAddress, setSignupAddress] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoginError('');
    const success = onLogin(email.trim(), password);
    if (!success) {
      setLoginError('Account not found. Please create one.');
    } else {
      setShowIntro(true);
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail.trim() || !signupPassword || !signupLabel.trim()) return;
    onSignup(
      signupEmail.trim(),
      signupPassword,
      signupLabel.trim(),
      signupPhone.trim() || undefined,
      signupAddress.trim() || undefined
    );
    navigate('/');
  };

  if (showIntro) {
    return <IntroScene onFinish={() => navigate('/')} />;
  }

  if (showSignup) {
    return (
      <LoginContainer>
        <Form onSubmit={handleSignupSubmit}>
          <h2>Sign Up</h2>
          <Input
            type="email"
            placeholder="Email"
            value={signupEmail}
            onChange={e => setSignupEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={signupPassword}
            onChange={e => setSignupPassword(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Name"
            value={signupLabel}
            onChange={e => setSignupLabel(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Phone (optional)"
            value={signupPhone}
            onChange={e => setSignupPhone(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Address (optional)"
            value={signupAddress}
            onChange={e => setSignupAddress(e.target.value)}
          />
          <Button type="submit">Create Account</Button>
          <p>
            Already have an account?{' '}
            <button type="button" onClick={() => setShowSignup(false)}>
              Login
            </button>
          </p>
        </Form>
      </LoginContainer>
    );
  }
  return (
    <LoginContainer>
      <Form onSubmit={handleLoginSubmit}>
        <h2>Login</h2>
        {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <Button type="submit">Login</Button>
        <p>
          Don't have an account?{' '}
          <button type="button" onClick={() => setShowSignup(true)}>
            Sign up
          </button>
        </p>
      </Form>
    </LoginContainer>
  );
};

export default Login; 