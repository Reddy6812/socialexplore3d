import { IUserRepository } from './userInterfaces';
import { createUserApi, getUserApi, ApiUser } from '../api/graphApi';

/** Concrete implementation of IUserRepository using REST API */
export class UserRepository implements IUserRepository {
  async createUser(id: string, name: string, role: 'general' | 'student' | 'company'): Promise<ApiUser> {
    return createUserApi(id, name, role);
  }

  async getUser(id: string): Promise<ApiUser> {
    return getUserApi(id);
  }
} 