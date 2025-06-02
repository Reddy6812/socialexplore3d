import React, { FC, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCompanyData } from '../hooks/useCompanyData';

const JobDetailPage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const companyData = useCompanyData();
  const [job, setJob] = useState<typeof companyData.jobs[0] | null>(null);
  const [applicants, setApplicants] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (id) {
      const found = companyData.jobs.find(j => j.id === id);
      if (found) setJob(found);
      // TODO: load applicants via API call
      // e.g. getJobApplicantsApi(id).then(setApplicants);
    }
  }, [id, companyData.jobs]);

  if (!job) return <div style={{ padding: '16px' }}>Job not found.</div>;

  return (
    <div style={{ padding: '16px' }}>
      <h2>{job.title}</h2>
      {job.description && <p>{job.description}</p>}
      {job.location && <p><strong>Location:</strong> {job.location}</p>}
      <button onClick={() => companyData.applyToJob(job.id, /* current user id */ '')}>
        Apply
      </button>
      <h3>Applicants</h3>
      <ul>
        {applicants.map(a => (
          <li key={a.id}>{a.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default JobDetailPage; 