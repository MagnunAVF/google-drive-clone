import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from './interfaces/user.interface';

@Injectable()
export class UsersService {
  // hardcoded user for initial tests
  private readonly users: User[] = [
    {
      id: '1',
      email: 'user@example.com',
      password: bcrypt.hashSync('password123', 10),
    },
  ];

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find((user) => user.email === email);
  }

  async findById(id: string): Promise<User | undefined> {
    return this.users.find((user) => user.id === id);
  }
}
