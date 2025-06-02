import { ApiCompany, ApiJob } from '../api/companyApi';

export interface ICompanyRepository {
  // Fetch the list of companies
  getCompanies(): Promise<ApiCompany[]>;
  // Fetch employees for a given company
  getEmployees(companyId: string): Promise<{ id: string; name: string }[]>;
  // Hire a user at a given company
  addEmployee(companyId: string, userId: string): Promise<void>;
  // Create a new company
  createCompany(id: string, name: string, industry: string, location: string): Promise<ApiCompany>;
}

export interface IJobRepository {
  // Fetch jobs for a given company
  getJobs(companyId: string): Promise<ApiJob[]>;
  // Create a new job for a company
  addJob(companyId: string, title: string, description?: string, location?: string): Promise<ApiJob>;
  // Delete a job by ID
  removeJob(jobId: string): Promise<void>;
  // Apply for a job as a student
  applyJob(jobId: string, userId: string): Promise<void>;
  // Fetch applicants for a job
  getJobApplicants(jobId: string): Promise<{ id: string; name: string }[]>;
} 