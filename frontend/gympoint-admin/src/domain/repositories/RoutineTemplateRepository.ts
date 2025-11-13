import { RoutineTemplate, CreateRoutineTemplateDTO, UpdateRoutineTemplateDTO } from '../entities';

export interface RoutineTemplateRepository {
  getAllTemplates(): Promise<RoutineTemplate[]>;
  getTemplateById(id: number): Promise<RoutineTemplate>;
  createTemplate(template: CreateRoutineTemplateDTO): Promise<RoutineTemplate>;
  updateTemplate(template: UpdateRoutineTemplateDTO): Promise<RoutineTemplate>;
  deleteTemplate(id: number): Promise<void>;
}


