import React, { useState, useEffect } from 'react';
import { Reward, CreateRewardDTO, REWARD_TYPES } from '@/domain';
import { Input, Select, Textarea, Button } from './index';

interface RewardFormProps {
  reward?: Reward;
  onSubmit: (data: CreateRewardDTO) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const RewardForm = ({ reward, onSubmit, onCancel, isLoading }: RewardFormProps) => {
  const [formData, setFormData] = useState<CreateRewardDTO>({
    name: '',
    description: '',
    reward_type: 'descuento',
    effect_value: null,
    cost_tokens: 50,
    stock: 100,
    start_date: '',
    finish_date: '',
    available: true,
    image_url: '',
    terms: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (reward) {
      setFormData({
        name: reward.name,
        description: reward.description,
        reward_type: reward.reward_type || 'descuento', // Usar 'descuento' por defecto si es null/undefined
        effect_value: reward.effect_value || null,
        cost_tokens: reward.cost_tokens,
        stock: reward.stock,
        start_date: reward.start_date ? reward.start_date.split('T')[0] : '',
        finish_date: reward.finish_date ? reward.finish_date.split('T')[0] : '',
        available: reward.available,
        image_url: reward.image_url || '',
        terms: reward.terms || '',
      });
    }
  }, [reward]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    if (formData.cost_tokens <= 0) newErrors.cost_tokens = 'El costo debe ser mayor a 0';
    if (formData.stock < 0) newErrors.stock = 'El stock no puede ser negativo';
    if (!formData.start_date) newErrors.start_date = 'La fecha de inicio es requerida';
    if (!formData.finish_date) newErrors.finish_date = 'La fecha de fin es requerida';
    if (formData.start_date && formData.finish_date) {
      if (new Date(formData.finish_date) < new Date(formData.start_date)) {
        newErrors.finish_date = 'La fecha de fin debe ser posterior a la de inicio';
      }
    }

    // Validar effect_value según el tipo de recompensa
    if (formData.reward_type === 'pase_gratis' || formData.reward_type === 'descuento') {
      if (!formData.effect_value || formData.effect_value <= 0) {
        newErrors.effect_value = 'El valor del efecto es requerido y debe ser mayor a 0';
      }
      if (formData.reward_type === 'descuento' && formData.effect_value && formData.effect_value > 100) {
        newErrors.effect_value = 'El porcentaje de descuento no puede ser mayor a 100';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  // Mapeo de tipos a nombres descriptivos en español
  const getRewardTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'descuento': '💰 Descuento',
      'pase_gratis': '🎟️ Pase Premium Gratis',
      'producto': '📦 Producto Físico',
      'servicio': '✨ Servicio Especial',
      'merchandising': '👕 Merchandising',
      'otro': '🎁 Otro'
    };
    return labels[type] || type;
  };

  const rewardTypeOptions = REWARD_TYPES.map(type => ({
    value: type,
    label: getRewardTypeLabel(type)
  }));

  // Helper para obtener el placeholder y label del effect_value según el tipo
  const getEffectValueInfo = () => {
    switch (formData.reward_type) {
      case 'pase_gratis':
        return {
          label: '⏰ Días de Premium',
          placeholder: 'Ej: 1, 7, 30',
          description: 'Cantidad de días de suscripción premium que otorga esta recompensa'
        };
      case 'descuento':
        return {
          label: '💯 Porcentaje de Descuento',
          placeholder: 'Ej: 10, 20, 50',
          description: 'Porcentaje de descuento a aplicar (0-100)'
        };
      default:
        return {
          label: '🎁 Valor del Efecto',
          placeholder: 'Valor numérico',
          description: 'Valor asociado al efecto de la recompensa (opcional)'
        };
    }
  };

  const effectInfo = getEffectValueInfo();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          label="🏆 Nombre de la Recompensa *"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ej: Pase 1 día gratis"
          maxLength={50}
          disabled={isLoading}
          error={errors.name}
        />
        <Select
          label="📦 Tipo de Recompensa *"
          name="reward_type"
          value={formData.reward_type}
          onChange={handleChange}
          disabled={isLoading}
          options={rewardTypeOptions}
        />
      </div>

      {/* Campo effect_value - solo para tipos que lo necesitan */}
      {(formData.reward_type === 'pase_gratis' || formData.reward_type === 'descuento') && (
        <div className="space-y-1">
          <Input
            label={effectInfo.label + ' *'}
            type="number"
            name="effect_value"
            value={formData.effect_value || ''}
            onChange={handleChange}
            min={1}
            max={formData.reward_type === 'descuento' ? 100 : undefined}
            placeholder={effectInfo.placeholder}
            disabled={isLoading}
            error={errors.effect_value}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 ml-1">
            ℹ️ {effectInfo.description}
          </p>
        </div>
      )}

      <Textarea
        label="📝 Descripción *"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Describe la recompensa..."
        maxLength={250}
        rows={2}
        disabled={isLoading}
        error={errors.description}
      />

      <Input
        label="🖼️ URL de Imagen (Opcional)"
        name="image_url"
        value={formData.image_url || ''}
        onChange={handleChange}
        placeholder="https://ejemplo.com/imagen-recompensa.jpg"
        disabled={isLoading}
        error={errors.image_url}
      />

      <Textarea
        label="📜 Términos y Condiciones (Opcional)"
        name="terms"
        value={formData.terms || ''}
        onChange={handleChange}
        placeholder="Ej: Válido de lunes a viernes de 6am a 10pm. No acumulable con otras promociones. Expira 30 días después del canje."
        maxLength={500}
        rows={3}
        disabled={isLoading}
        error={errors.terms}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          label="💰 Costo en Tokens *"
          type="number"
          name="cost_tokens"
          value={formData.cost_tokens}
          onChange={handleChange}
          min={1}
          placeholder="50"
          disabled={isLoading}
          error={errors.cost_tokens}
        />
        <Input
          label="📊 Stock Disponible *"
          type="number"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          min={0}
          placeholder="100"
          disabled={isLoading}
          error={errors.stock}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          label="📅 Fecha de Inicio *"
          type="date"
          name="start_date"
          value={formData.start_date}
          onChange={handleChange}
          disabled={isLoading}
          error={errors.start_date}
        />
        <Input
          label="📅 Fecha de Fin *"
          type="date"
          name="finish_date"
          value={formData.finish_date}
          onChange={handleChange}
          disabled={isLoading}
          error={errors.finish_date}
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="available"
          name="available"
          checked={formData.available}
          onChange={handleCheckboxChange}
          disabled={isLoading}
          className="h-4 w-4 rounded border-input-border dark:border-input-border-dark bg-input-bg dark:bg-input-bg-dark text-primary focus:ring-primary"
        />
        <label htmlFor="available" className="text-sm font-medium text-text dark:text-text-dark">✅ Disponible para canje</label>
      </div>

      <div className="flex justify-end gap-3 pt-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>✕ Cancelar</Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? '⏳ Guardando...' : reward ? '💾 Actualizar Recompensa' : '✨ Crear Recompensa'}
        </Button>
      </div>
    </form>
  );
};
