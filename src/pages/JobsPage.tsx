import React, { FC, useState, useEffect } from 'react';
import { useCompanyData, Job } from '../hooks/useCompanyData';

const JobsPage: FC = () => {
  const companyData = useCompanyData();
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState({ title: '', location: '' });

  useEffect(() => {
    // Load jobs for all companies
    const loadAll = async () => {
      const lists: Job[][] = [];
      for (const c of companyData.companies) {
        await companyData.loadJobs(c.id);
        lists.push(companyData.jobs);
      }
      setAllJobs(lists.flat());
    };
    loadAll();
  }, [companyData.companies]);

  const filteredJobs = allJobs.filter(j =>
    j.title.toLowerCase().includes(filter.title.toLowerCase()) &&
    (j.location ?? '').toLowerCase().includes(filter.location.toLowerCase())
  );

  return (
    <div style={{ padding: '16px' }}>
      <h2>All Jobs</h2>
      <div style={{ marginBottom: '16px' }}>
        <input
          placeholder="Search title..."
          value={filter.title}
          onChange={e => setFilter(prev => ({ ...prev, title: e.target.value }))}
          style={{ marginRight: '8px' }}
        />
        <input
          placeholder="Location..."
          value={filter.location}
          onChange={e => setFilter(prev => ({ ...prev, location: e.target.value }))}
        />
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {filteredJobs.map(j => (
          <li key={j.id} style={{ marginBottom: '12px' }}>
            <a href={`/jobs/${j.id}`}>{j.title}</a> {j.location && `(${j.location})`}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default JobsPage; 