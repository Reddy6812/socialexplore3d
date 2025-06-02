import { IUserRepository } from './userInterfaces';
import { ApiUser } from '../api/graphApi';

/** Use-case class for user-related workflows */
export class UserUseCases {
  constructor(private repo: IUserRepository) {}

  // Create or update a user
  createUser(id: string, name: string, role: 'general' | 'student' | 'company'): Promise<ApiUser> {
    return this.repo.createUser(id, name, role);
  }

  // Get a user by ID
  getUser(id: string): Promise<ApiUser> {
    return this.repo.getUser(id);
  }
} 