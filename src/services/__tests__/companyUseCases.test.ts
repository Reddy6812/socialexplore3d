import { CompanyUseCases } from '../companyUseCases';
import { ICompanyRepository } from '../companyJobInterfaces';

describe('CompanyUseCases', () => {
  let mockRepo: jest.Mocked<ICompanyRepository>;
  let useCases: CompanyUseCases;

  beforeEach(() => {
    mockRepo = {
      getCompanies: jest.fn().mockResolvedValue([
        { id: '1', name: 'Acme', industry: 'Tech', location: 'NY' }
      ]),
      createCompany: jest.fn().mockResolvedValue(
        { id: '2', name: 'NewCo', industry: 'Finance', location: 'LA' }
      ),
      getEmployees: jest.fn().mockResolvedValue([
        { id: '3', name: 'Bob' }
      ]),
      addEmployee: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<ICompanyRepository>;
    useCases = new CompanyUseCases(mockRepo);
  });

  it('listCompanies calls repo.getCompanies and returns data', async () => {
    const companies = await useCases.listCompanies();
    expect(mockRepo.getCompanies).toHaveBeenCalled();
    expect(companies).toEqual([{ id: '1', name: 'Acme', industry: 'Tech', location: 'NY' }]);
  });

  it('createCompany calls repo.createCompany with correct args', async () => {
    const result = await useCases.createCompany('2', 'NewCo', 'Finance', 'LA');
    expect(mockRepo.createCompany).toHaveBeenCalledWith('2', 'NewCo', 'Finance', 'LA');
    expect(result).toEqual({ id: '2', name: 'NewCo', industry: 'Finance', location: 'LA' });
  });

  it('listEmployees calls repo.getEmployees with correct companyId', async () => {
    const employees = await useCases.listEmployees('1');
    expect(mockRepo.getEmployees).toHaveBeenCalledWith('1');
    expect(employees).toEqual([{ id: '3', name: 'Bob' }]);
  });

  it('hireEmployee calls repo.addEmployee with correct args', async () => {
    await useCases.hireEmployee('1', '3');
    expect(mockRepo.addEmployee).toHaveBeenCalledWith('1', '3');
  });
}); 