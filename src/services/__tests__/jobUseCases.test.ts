import { JobUseCases } from '../companyUseCases';
import { IJobRepository } from '../companyJobInterfaces';
import { ApiJob } from '../../api/companyApi';

describe('JobUseCases', () => {
  let mockRepo: jest.Mocked<IJobRepository>;
  let useCases: JobUseCases;

  beforeEach(() => {
    mockRepo = {
      getJobs: jest.fn().mockResolvedValue([
        { id: 'j1', companyId: 'c1', title: 'Dev', description: 'Desc', location: 'NY', postedAt: '2023-01-01T00:00:00Z' }
      ] as ApiJob[]),
      addJob: jest.fn().mockResolvedValue(
        { id: 'j2', companyId: 'c1', title: 'QA', description: '', location: '', postedAt: '2023-01-02T00:00:00Z' }
      ),
      removeJob: jest.fn().mockResolvedValue(undefined),
      applyJob: jest.fn().mockResolvedValue(undefined),
      getJobApplicants: jest.fn().mockResolvedValue([
        { id: 'u1', name: 'Alice' }
      ])
    } as unknown as jest.Mocked<IJobRepository>;
    useCases = new JobUseCases(mockRepo);
  });

  it('listJobs calls repo.getJobs and returns data', async () => {
    const jobs = await useCases.listJobs('c1');
    expect(mockRepo.getJobs).toHaveBeenCalledWith('c1');
    expect(jobs).toEqual([
      { id: 'j1', companyId: 'c1', title: 'Dev', description: 'Desc', location: 'NY', postedAt: '2023-01-01T00:00:00Z' }
    ]);
  });

  it('createJob calls repo.addJob with correct args and returns data', async () => {
    const result = await useCases.createJob('c1', 'QA', '', '');
    expect(mockRepo.addJob).toHaveBeenCalledWith('c1', 'QA', '', '');
    expect(result).toEqual({ id: 'j2', companyId: 'c1', title: 'QA', description: '', location: '', postedAt: '2023-01-02T00:00:00Z' });
  });

  it('removeJob calls repo.removeJob with jobId', async () => {
    await useCases.removeJob('j1');
    expect(mockRepo.removeJob).toHaveBeenCalledWith('j1');
  });

  it('applyToJob calls repo.applyJob with correct args', async () => {
    await useCases.applyToJob('j1', 'u1');
    expect(mockRepo.applyJob).toHaveBeenCalledWith('j1', 'u1');
  });

  it('listApplicants calls repo.getJobApplicants and returns data', async () => {
    const apps = await useCases.listApplicants('j1');
    expect(mockRepo.getJobApplicants).toHaveBeenCalledWith('j1');
    expect(apps).toEqual([{ id: 'u1', name: 'Alice' }]);
  });
}); 