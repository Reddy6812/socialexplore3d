import React, { FC, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';

// Smoke puff animation
const puff = keyframes`
  0% { opacity: 0.4; transform: scale(0.5) translateY(0); }
  50% { opacity: 0.1; transform: scale(1.5) translateY(-50px); }
  100% { opacity: 0; transform: scale(2) translateY(-100px); }
`;

// Falling node animation
const fall = keyframes`
  0% { transform: translateY(-50px); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: translateY(100vh); opacity: 0; }
`;

const Container = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-family: sans-serif;
`;

const Title = styled.h1`
  z-index: 10;
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const Smoke = styled.div`
  position: absolute;
  bottom: 0;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle at center, rgba(200,200,200,0.4), transparent 70%);
  animation: ${puff} 4s ease-out infinite;
  &:nth-child(2) {
    left: 30%;
    animation-delay: 1s;
  }
  &:nth-child(3) {
    left: 60%;
    animation-delay: 2s;
  }
`;

// Node circles falling animation, accepts left and delay props
const Node = styled.div<{ left: number; delay: number }>`
  position: absolute;
  top: -20px;
  left: ${props => props.left}%;
  width: 16px;
  height: 16px;
  background: #0f0;
  border-radius: 50%;
  opacity: 0;
  animation: ${fall} 5s linear infinite;
  animation-delay: ${props => props.delay}s;
`;

const WelcomePage: FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home');
    }, 5000);
    return () => clearTimeout(timer);
  }, [navigate]);
  return (
    <Container>
      <Title>Welcome to the World of Nodes</Title>
      {[...Array(3)].map((_, i) => (
        <Smoke key={i} style={{ left: `${20 + i * 30}%` }} />
      ))}
      {Array.from({ length: 10 }).map((_, i) => (
        <Node key={i} left={Math.random() * 100} delay={Math.random() * 5} />
      ))}
    </Container>
  );
};

export default WelcomePage; 