import React, { FC, useState, useEffect } from 'react';
import GraphCanvas from '../components/GraphCanvas';
import { useCompanyData } from '../hooks/useCompanyData';
import CompanyCard from '../components/CompanyCard';
import { NodeData, EdgeData } from '../hooks/useGraphData';

interface CompanyExplorerPageProps {
  userId: string;
  userRole: 'general' | 'student' | 'company';
}

const CompanyExplorerPage: FC<CompanyExplorerPageProps> = ({ userId, userRole }) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const companyData = useCompanyData();
  const companyNodes: NodeData[] = companyData.companies.map(c => ({
    id: c.id,
    label: c.name,
    position: [0, 0, 0] as [number, number, number],
  }));
  const companyEdges: EdgeData[] = [];

  useEffect(() => {
    if (selectedCompanyId) {
      companyData.loadJobs(selectedCompanyId);
      companyData.loadEmployees(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <GraphCanvas
        nodes={companyNodes}
        edges={companyEdges}
        currentUserId={userId}
        onNodeClick={n => setSelectedCompanyId(prev => (prev === n.id ? null : n.id))}
      />
      {selectedCompanyId && (() => {
        const company = companyData.companies.find(c => c.id === selectedCompanyId)!;
        const jobs = companyData.jobs;
        const employees = companyData.employees;
        return (
          <CompanyCard
            company={company}
            jobs={jobs}
            employees={employees}
            userRole={userRole}
            onApply={jobId => companyData.applyToJob(jobId, userId)}
            onConnect={empId => { /* TODO: implement connection */ }}
            onAddJob={job => companyData.addJob(company.id, job.title, job.description, job.location)}
            onRemoveJob={jobId => companyData.removeJob(jobId)}
            onViewApplicants={jobId => { /* TODO: view applicants */ }}
            onClose={() => setSelectedCompanyId(null)}
          />
        );
      })()}
    </div>
  );
};

export default CompanyExplorerPage; 