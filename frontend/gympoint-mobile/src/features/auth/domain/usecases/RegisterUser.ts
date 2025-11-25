import { AuthRepository, RegisterParams } from '../repositories/AuthRepository';

export class RegisterUser {
  constructor(private repo: AuthRepository) {}
  execute(params: RegisterParams) {
    return this.repo.register(params);
  }
}
