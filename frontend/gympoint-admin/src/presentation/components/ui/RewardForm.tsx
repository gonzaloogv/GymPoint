import React, { useState, useEffect } from 'react';
import { Reward, CreateRewardDTO, REWARD_TYPES } from '@/domain';

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
        start_date: reward.start_date.split('T')[0], // Extract YYYY-MM-DD
        finish_date: reward.finish_date.split('T')[0],
        available: reward.available,
      });
    }
  }, [reward]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));

    // Clear error when user starts typing
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

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (formData.cost_tokens <= 0) {
      newErrors.cost_tokens = 'El costo debe ser mayor a 0';
    }

    if (formData.stock < 0) {
      newErrors.stock = 'El stock no puede ser negativo';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'La fecha de inicio es requerida';
    }

    if (!formData.finish_date) {
      newErrors.finish_date = 'La fecha de fin es requerida';
    }

    if (formData.start_date && formData.finish_date) {
      const startDate = new Date(formData.start_date);
      const finishDate = new Date(formData.finish_date);
      
      if (finishDate < startDate) {
        newErrors.finish_date = 'La fecha de fin debe ser posterior a la fecha de inicio';
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

  return (
    <form onSubmit={handleSubmit} className="reward-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">🏆 Nombre de la Recompensa *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ej: Pase 1 día gratis"
            maxLength={50}
            disabled={isLoading}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="type">📦 Tipo de Recompensa *</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            disabled={isLoading}
          >
            {REWARD_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.replace(/_/g, ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description">📝 Descripción *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe la recompensa..."
          maxLength={250}
          rows={3}
          disabled={isLoading}
        />
        <small>{formData.description.length}/250 caracteres</small>
        {errors.description && <span className="error-text">{errors.description}</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="cost_tokens">💰 Costo en Tokens *</label>
          <input
            type="number"
            id="cost_tokens"
            name="cost_tokens"
            value={formData.cost_tokens}
            onChange={handleChange}
            min={1}
            placeholder="50"
            disabled={isLoading}
          />
          {errors.cost_tokens && <span className="error-text">{errors.cost_tokens}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="stock">📊 Stock Disponible *</label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            min={0}
            placeholder="100"
            disabled={isLoading}
          />
          {errors.stock && <span className="error-text">{errors.stock}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="start_date">📅 Fecha de Inicio *</label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.start_date && <span className="error-text">{errors.start_date}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="finish_date">📅 Fecha de Fin *</label>
          <input
            type="date"
            id="finish_date"
            name="finish_date"
            value={formData.finish_date}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.finish_date && <span className="error-text">{errors.finish_date}</span>}
        </div>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="available"
            checked={formData.available}
            onChange={handleCheckboxChange}
            disabled={isLoading}
          />
          <span>✅ Disponible para canje</span>
        </label>
        <small>Si está desactivado, los usuarios no podrán canjear esta recompensa</small>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? '⏳ Guardando...' : reward ? '💾 Actualizar Recompensa' : '✨ Crear Recompensa'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary" disabled={isLoading}>
          ✕ Cancelar
        </button>
      </div>
    </form>
  );
};




