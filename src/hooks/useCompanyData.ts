import { useState, useEffect } from 'react';
import { CompanyRepository } from '../services/companyRepository';
import { JobRepository } from '../services/jobRepository';
import { CompanyUseCases, JobUseCases } from '../services/companyUseCases';

// Represents a company entity
export interface Company {
  id: string;
  name: string;
  industry: string;
  location: string;
}

// Represents a job posted by a company
export interface Job {
  id: string;
  companyId: string;
  title: string;
  description?: string;
  location?: string;
}

// Hook to manage companies and jobs via API
export function useCompanyData() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [employees, setEmployees] = useState<{ id: string; name: string }[]>([]);

  // Set up repositories and use-cases
  const companyRepo = new CompanyRepository();
  const jobRepo = new JobRepository();
  const companyUseCases = new CompanyUseCases(companyRepo);
  const jobUseCases = new JobUseCases(jobRepo);

  // Load all companies once
  const loadCompanies = async () => {
    try {
      const data = await companyUseCases.listCompanies();
      setCompanies(data);
    } catch (e) {
      console.error('Failed to load companies', e);
    }
  };

  // Add a new company
  const addCompany = async (id: string, name: string, industry: string, location: string) => {
    try {
      return await companyUseCases.createCompany(id, name, industry, location);
    } catch (e) {
      console.error('Failed to create company', e);
    }
  };

  // Load jobs for a specific company
  const loadJobs = async (companyId: string) => {
    try {
      const data = await jobUseCases.listJobs(companyId);
      setJobs(data);
    } catch (e) {
      console.error('Failed to load jobs', e);
    }
  };

  // Create a new job for a company
  const addJob = async (
    companyId: string,
    title: string,
    description?: string,
    location?: string
  ) => {
    try {
      const job = await jobUseCases.createJob(companyId, title, description, location);
      setJobs(prev => [...prev, job]);
      return job;
    } catch (e) {
      console.error('Failed to create job', e);
    }
  };

  // Delete a job by ID
  const removeJob = async (jobId: string) => {
    try {
      await jobUseCases.removeJob(jobId);
      setJobs(prev => prev.filter(j => j.id !== jobId));
    } catch (e) {
      console.error('Failed to delete job', e);
    }
  };

  // Apply for a job as a student
  const applyToJob = async (jobId: string, userId: string) => {
    try {
      await jobUseCases.applyToJob(jobId, userId);
    } catch (e) {
      console.error('Failed to apply for job', e);
    }
  };

  // Load employees who work at a specific company
  const loadEmployees = async (companyId: string) => {
    try {
      const data = await companyUseCases.listEmployees(companyId);
      setEmployees(data);
    } catch (e) {
      console.error('Failed to load employees', e);
    }
  };

  // Hire a user at a specific company
  const hireEmployee = async (companyId: string, userId: string) => {
    try {
      await companyUseCases.hireEmployee(companyId, userId);
      // refresh employee list
      await loadEmployees(companyId);
    } catch (e) {
      console.error('Failed to hire employee', e);
    }
  };

  useEffect(() => {
    loadCompanies();
  }, []);

  return {
    companies,
    jobs,
    employees,
    loadCompanies,
    loadJobs,
    addCompany,
    addJob,
    removeJob,
    applyToJob,
    loadEmployees,
    hireEmployee,
  };
} 