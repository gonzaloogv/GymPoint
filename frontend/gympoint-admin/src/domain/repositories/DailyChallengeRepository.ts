import {
  DailyChallenge,
  DailyChallengeTemplate,
  DailyChallengeConfig,
  CreateDailyChallengeDTO,
  UpdateDailyChallengeDTO,
  CreateDailyChallengeTemplateDTO,
  UpdateDailyChallengeTemplateDTO
} from '../entities';

export interface DailyChallengeRepository {
  getChallenges(params?: { from?: string; to?: string; include_inactive?: boolean }): Promise<DailyChallenge[]>;
  getChallenge(id: number): Promise<DailyChallenge>;
  createChallenge(payload: CreateDailyChallengeDTO): Promise<DailyChallenge>;
  updateChallenge(payload: UpdateDailyChallengeDTO): Promise<DailyChallenge>;
  deleteChallenge(id: number): Promise<void>;

  getTemplates(): Promise<DailyChallengeTemplate[]>;
  createTemplate(payload: CreateDailyChallengeTemplateDTO): Promise<DailyChallengeTemplate>;
  updateTemplate(payload: UpdateDailyChallengeTemplateDTO): Promise<DailyChallengeTemplate>;
  deleteTemplate(id: number): Promise<void>;

  getConfig(): Promise<DailyChallengeConfig>;
  updateConfig(payload: Partial<DailyChallengeConfig>): Promise<DailyChallengeConfig>;
  runRotation(): Promise<DailyChallenge | null>;
}
