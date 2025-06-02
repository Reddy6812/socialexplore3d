import React, { FC } from 'react';
import styled from 'styled-components';
import { Company, Job } from '../hooks/useCompanyData';
import { NodeData } from '../hooks/useGraphData';

const Card = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  width: 300px;
  max-height: 80vh;
  overflow-y: auto;
`;

interface CompanyCardProps {
  company: Company;
  jobs: Job[];
  employees: NodeData[];
  userRole: 'general' | 'student' | 'company';
  onApply: (jobId: string) => void;
  onConnect: (employeeId: string) => void;
  onAddJob: (job: Omit<Job, 'id' | 'companyId'>) => void;
  onRemoveJob: (jobId: string) => void;
  onViewApplicants: (jobId: string) => void;
  onClose: () => void;
}

const Close = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
`;

const CompanyCard: FC<CompanyCardProps> = ({ company, jobs, employees, userRole, onApply, onConnect, onAddJob, onRemoveJob, onViewApplicants, onClose }) => {
  return (
    <Card>
      <Close onClick={onClose}>×</Close>
      <h3>{company.name}</h3>
      <p><strong>Industry:</strong> {company.industry}</p>
      <p><strong>Location:</strong> {company.location}</p>

      <h4>Jobs</h4>
      {jobs.length === 0 ? <p>No open positions.</p> : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {jobs.map(j => (
            <li key={j.id} style={{ marginBottom: '8px' }}>
              <strong>{j.title}</strong> {j.location && `(${j.location})`}
              <div style={{ marginTop: '4px' }}>
                {userRole === 'student' && <button onClick={() => onApply(j.id)}>Apply</button>}
                {userRole === 'company' && (
                  <> 
                    <button onClick={() => onViewApplicants(j.id)}>Applicants</button>{' '}
                    <button onClick={() => onRemoveJob(j.id)}>Delete</button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {userRole === 'company' && (
        <button onClick={() => {
          const title = prompt('Job title?');
          if (title) {
            onAddJob({ title, description: '', location: '' });
          }
        }}>Add Job</button>
      )}

      <h4 style={{ marginTop: '16px' }}>Employees</h4>
      {employees.length === 0 ? <p>No employees listed.</p> : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {employees.map(e => (
            <li key={e.id} style={{ marginBottom: '6px' }}>
              {e.label} 
              {userRole !== 'company' && <button onClick={() => onConnect(e.id)} style={{ marginLeft: '6px' }}>Connect</button>}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

export default CompanyCard; 