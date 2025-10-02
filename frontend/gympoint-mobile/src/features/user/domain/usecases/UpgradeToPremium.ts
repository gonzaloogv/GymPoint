import { UserRepository } from '../repositories/UserRepository';
import { UserProfile } from '../entities/UserProfile';

export class UpgradeToPremium {
  constructor(private repository: UserRepository) {}

  async execute(): Promise<UserProfile> {
    return this.repository.upgradeToPremium();
  }
}

