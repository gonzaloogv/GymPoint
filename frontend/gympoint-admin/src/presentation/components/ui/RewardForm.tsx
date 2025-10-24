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
    type: 'descuento',
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
        type: reward.type,
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      console.log('[RewardForm] Enviando formData:', formData);
      console.log('[RewardForm] formData.type:', formData.type, 'type:', typeof formData.type);
      onSubmit(formData);
    }
  };

  const rewardTypeOptions = REWARD_TYPES.map(type => ({ 
    value: type, 
    label: type.replace(/_/g, ' ').toUpperCase() 
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          name="type"
          value={formData.type}
          onChange={handleChange}
          disabled={isLoading}
          options={rewardTypeOptions}
        />
      </div>

      <Textarea
        label="📝 Descripción *"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Describe la recompensa..."
        maxLength={250}
        rows={3}
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
        rows={4}
        disabled={isLoading}
        error={errors.terms}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

      <div className="flex justify-end gap-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>✕ Cancelar</Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? '⏳ Guardando...' : reward ? '💾 Actualizar Recompensa' : '✨ Crear Recompensa'}
        </Button>
      </div>
    </form>
  );
};
