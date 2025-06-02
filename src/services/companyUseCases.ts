import { ICompanyRepository, IJobRepository } from './companyJobInterfaces';
import { ApiCompany, ApiJob } from '../api/companyApi';

/** Use-case class for company-related workflows */
export class CompanyUseCases {
  constructor(private repo: ICompanyRepository) {}

  // List all companies
  listCompanies(): Promise<ApiCompany[]> {
    return this.repo.getCompanies();
  }

  // Create a new company
  createCompany(id: string, name: string, industry: string, location: string): Promise<ApiCompany> {
    return this.repo.createCompany(id, name, industry, location);
  }

  // List all employees for a company
  listEmployees(companyId: string): Promise<{ id: string; name: string }[]> {
    return this.repo.getEmployees(companyId);
  }

  // Hire an employee for a company
  hireEmployee(companyId: string, userId: string): Promise<void> {
    return this.repo.addEmployee(companyId, userId);
  }
}

/** Use-case class for job-related workflows */
export class JobUseCases {
  constructor(private repo: IJobRepository) {}

  // List jobs for a company
  listJobs(companyId: string): Promise<ApiJob[]> {
    return this.repo.getJobs(companyId);
  }

  // Create a job for a company
  createJob(companyId: string, title: string, description?: string, location?: string): Promise<ApiJob> {
    return this.repo.addJob(companyId, title, description, location);
  }

  // Remove a job by ID
  removeJob(jobId: string): Promise<void> {
    return this.repo.removeJob(jobId);
  }

  // Apply to a job
  applyToJob(jobId: string, userId: string): Promise<void> {
    return this.repo.applyJob(jobId, userId);
  }

  // List applicants for a job
  listApplicants(jobId: string): Promise<{ id: string; name: string }[]> {
    return this.repo.getJobApplicants(jobId);
  }
} 