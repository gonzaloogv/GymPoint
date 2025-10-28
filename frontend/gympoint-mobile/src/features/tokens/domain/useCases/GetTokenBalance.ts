import { TokenRepository } from '../repositories/TokenRepository';
import { TokenBalance } from '../entities/TokenTransaction';

export class GetTokenBalance {
  constructor(private repository: TokenRepository) {}

  async execute(): Promise<TokenBalance> {
    return this.repository.getTokenBalance();
  }
}
