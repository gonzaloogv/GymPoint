import { RoutineTemplateRepository, RoutineTemplate, CreateRoutineTemplateDTO, UpdateRoutineTemplateDTO } from '@/domain';
import { apiClient } from '../api';

export class RoutineTemplateRepositoryImpl implements RoutineTemplateRepository {
  async getAllTemplates(): Promise<RoutineTemplate[]> {
    const response = await apiClient.get<{ templates: RoutineTemplate[] }>('/admin/routines/templates');
    return response.data.templates;
  }

  async getTemplateById(id: number): Promise<RoutineTemplate> {
    // Usar el endpoint genérico de rutinas que sí incluye días y ejercicios
    const response = await apiClient.get<any>(`/routines/${id}`);
    console.log('🔍 Response RAW:', response);
    console.log('🔍 Response.data:', response.data);
    console.log('🔍 Response.data.data:', response.data.data);
    
    const template = response.data.data as RoutineTemplate;
    console.log('🔍 Template parseado:', template);
    console.log('🔍 Template.days:', template.days);
    console.log('🔍 Template.exercises:', template.exercises);
    
    return template;
  }

  async createTemplate(template: CreateRoutineTemplateDTO): Promise<RoutineTemplate> {
    const response = await apiClient.post<{ id_routine: number; routine_name: string }>('/admin/routines/templates', template);
    // Retornar un objeto mínimo ya que el backend solo retorna id y nombre
    return {
      id_routine: response.data.id_routine,
      routine_name: response.data.routine_name,
      description: template.description || null,
      recommended_for: template.recommended_for,
      is_template: true,
      created_by: null,
      template_order: template.template_order || 0,
    } as RoutineTemplate;
  }

  async updateTemplate(template: UpdateRoutineTemplateDTO): Promise<RoutineTemplate> {
    const { id_routine, ...data } = template;
    const response = await apiClient.put<{ id_routine: number; routine_name: string }>(`/admin/routines/templates/${id_routine}`, data);
    return {
      id_routine: response.data.id_routine,
      routine_name: response.data.routine_name,
      description: null,
      recommended_for: null,
      is_template: true,
      created_by: null,
      template_order: 0,
    } as RoutineTemplate;
  }

  async deleteTemplate(id: number): Promise<void> {
    await apiClient.delete(`/admin/routines/templates/${id}`);
  }
}


