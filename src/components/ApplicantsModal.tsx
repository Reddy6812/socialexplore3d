import React, { FC } from 'react';
import styled from 'styled-components';

interface Applicant { id: string; name: string; }

interface ApplicantsModalProps {
  applicants: Applicant[];
  onClose: () => void;
  onConnect: (id: string) => void;
  onMessage: (id: string) => void;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  z-index: 100;
`;

const Panel = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  height: 100%;
  background: #fff;
  box-shadow: -2px 0 8px rgba(0,0,0,0.2);
  overflow-y: auto;
  padding: 16px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
`;

const ApplicantsModal: FC<ApplicantsModalProps> = ({ applicants, onClose, onConnect, onMessage }) => (
  <Overlay onClick={onClose}>
    <Panel onClick={e => e.stopPropagation()}>
      <CloseButton onClick={onClose}>×</CloseButton>
      <h3>Applicants</h3>
      {applicants.length === 0 ? (
        <p>No applicants yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {applicants.map(a => (
            <li key={a.id} style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{a.name}</span>
              <div>
                <button onClick={() => onConnect(a.id)} style={{ marginRight: '8px' }}>Connect</button>
                <button onClick={() => onMessage(a.id)}>Message</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  </Overlay>
);

export default ApplicantsModal; 