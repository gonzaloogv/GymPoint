import { AuthRepository } from '../repositories/AuthRepository';
export class LoginUser {
  constructor(private repo: AuthRepository) {}
  execute(p: { email: string; password: string }) {
    return this.repo.login(p.email, p.password);
  }
}
