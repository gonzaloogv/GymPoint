import { AuthRepository } from '../repositories/AuthRepository';
export class GetMe {
constructor(private repo: AuthRepository) {}
execute() { return this.repo.me(); }
}