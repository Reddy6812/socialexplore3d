import {
  IJobRepository
} from './companyJobInterfaces';
import {
  getCompanyJobsApi,
  createJobApi,
  deleteJobApi,
  applyJobApi,
  getJobApplicantsApi
} from '../api/companyApi';
import { ApiJob } from '../api/companyApi';

/** Concrete implementation of IJobRepository using REST API */
export class JobRepository implements IJobRepository {
  async getJobs(companyId: string): Promise<ApiJob[]> {
    return getCompanyJobsApi(companyId);
  }

  async addJob(companyId: string, title: string, description?: string, location?: string): Promise<ApiJob> {
    return createJobApi(companyId, title, description, location);
  }

  async removeJob(jobId: string): Promise<void> {
    return deleteJobApi(jobId);
  }

  async applyJob(jobId: string, userId: string): Promise<void> {
    return applyJobApi(jobId, userId);
  }

  async getJobApplicants(jobId: string): Promise<{ id: string; name: string }[]> {
    return getJobApplicantsApi(jobId);
  }
} 