import { ApiUser } from '../api/graphApi';

export interface IUserRepository {
  // Create or update a user
  createUser(id: string, name: string, role: 'general' | 'student' | 'company'): Promise<ApiUser>;
  // Fetch a user by ID
  getUser(id: string): Promise<ApiUser>;
} 