import {
  ICompanyRepository
} from './companyJobInterfaces';
import {
  getCompaniesApi,
  getCompanyEmployeesApi,
  addCompanyEmployeeApi,
  createCompanyApi
} from '../api/companyApi';
import { ApiCompany } from '../api/companyApi';

/** Concrete implementation of ICompanyRepository using REST API */
export class CompanyRepository implements ICompanyRepository {
  async getCompanies(): Promise<ApiCompany[]> {
    return getCompaniesApi();
  }

  async createCompany(id: string, name: string, industry: string, location: string): Promise<ApiCompany> {
    return createCompanyApi(id, name, industry, location);
  }

  async getEmployees(companyId: string): Promise<{ id: string; name: string }[]> {
    return getCompanyEmployeesApi(companyId);
  }

  async addEmployee(companyId: string, userId: string): Promise<void> {
    return addCompanyEmployeeApi(companyId, userId);
  }
} 