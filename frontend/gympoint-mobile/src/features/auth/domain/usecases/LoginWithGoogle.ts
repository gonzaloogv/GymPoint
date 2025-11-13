import { AuthRepository } from '../repositories/AuthRepository';

export class LoginWithGoogle {
  constructor(private repo: AuthRepository) {}

  execute(payload: { idToken: string }) {
    return this.repo.loginWithGoogle(payload.idToken);
  }
}
