import React, { useState, useEffect } from 'react';
import { Reward, CreateRewardDTO, REWARD_TYPES, RewardType } from '@/domain';
import { Input, Select, Textarea, Button } from './index';

interface RewardFormProps {
  reward?: Reward;
  onSubmit: (data: CreateRewardDTO) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const STACKABLE_REWARD_TYPES: RewardType[] = ['token_multiplier', 'streak_saver'];

export const RewardForm = ({ reward, onSubmit, onCancel, isLoading }: RewardFormProps) => {
  const [formData, setFormData] = useState<CreateRewardDTO>({
    name: '',
    description: '',
    reward_type: 'descuento',
    effect_value: null,
    cost_tokens: 50,
    cooldown_days: 0,
    is_unlimited: false,
    requires_premium: false,
    is_stackable: false,
    max_stack: 1,
    duration_days: null,
    stock: 100,
    start_date: '',
    finish_date: '',
    available: true,
    image_url: '',
    terms: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isStackableForced = STACKABLE_REWARD_TYPES.includes(formData.reward_type as RewardType);

  useEffect(() => {
    if (reward) {
      const isStackableReward = reward.reward_type === 'token_multiplier' || reward.reward_type === 'streak_saver';

      setFormData({
        name: reward.name,
        description: reward.description,
        reward_type: reward.reward_type || 'descuento', // Usar 'descuento' por defecto si es null/undefined
        effect_value: reward.effect_value || null,
        cost_tokens: reward.cost_tokens,
        cooldown_days: reward.cooldown_days ?? 0,
        is_unlimited: reward.is_unlimited ?? false,
        requires_premium: reward.requires_premium ?? false,
        is_stackable: isStackableReward ? true : reward.is_stackable ?? false,
        max_stack: isStackableReward
          ? reward.max_stack ?? (reward.reward_type === 'streak_saver' ? 5 : 3)
          : reward.max_stack ?? 1,
        duration_days: reward.reward_type === 'token_multiplier' ? reward.duration_days ?? 7 : reward.duration_days ?? null,
        stock: reward.is_unlimited ? null : reward.stock ?? 0,
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
    const parsedValue = type === 'number' ? Number(value) : value;

    setFormData((prev) => {
      if (name === 'reward_type') {
        const nextType = value as CreateRewardDTO['reward_type'];
        const isMultiplier = nextType === 'token_multiplier';
        const isStreakSaver = nextType === 'streak_saver';

        return {
          ...prev,
          reward_type: nextType,
          is_stackable: (isMultiplier || isStreakSaver) ? true : prev.is_stackable ?? false,
          max_stack: (isMultiplier || isStreakSaver)
            ? prev.max_stack ?? (isStreakSaver ? 5 : 3)
            : prev.max_stack ?? 1,
          duration_days: isMultiplier ? (prev.duration_days ?? 7) : null,
        };
      }

      if (name === 'stock' && prev.is_unlimited) {
        return prev;
      }

      return {
        ...prev,
        [name]: parsedValue,
      };
    });
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

    if (name === 'is_stackable' && isStackableForced) {
      return;
    }

    setFormData((prev) => {
      if (name === 'is_unlimited') {
        return {
          ...prev,
          is_unlimited: checked,
          stock: checked ? null : (prev.stock ?? 0),
        };
      }

      if (name === 'is_stackable') {
        return {
          ...prev,
          is_stackable: checked,
          max_stack: checked ? (prev.max_stack ?? 1) : 1,
        };
      }

      return {
        ...prev,
        [name]: checked,
      };
    });
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    if (formData.cost_tokens < 0) newErrors.cost_tokens = 'El costo no puede ser negativo';
    if (formData.cooldown_days !== undefined && formData.cooldown_days < 0) {
      newErrors.cooldown_days = 'El cooldown no puede ser negativo';
    }
    if (!formData.is_unlimited) {
      if (formData.stock === null || formData.stock === undefined) {
        newErrors.stock = 'Debes definir un stock o marcar la recompensa como ilimitada';
      } else if (formData.stock < 0) {
        newErrors.stock = 'El stock no puede ser negativo';
      }
    }
    if (formData.is_stackable && (!formData.max_stack || formData.max_stack < 1)) {
      newErrors.max_stack = 'El máximo acumulable debe ser al menos 1';
    }
    if (formData.is_stackable && !STACKABLE_REWARD_TYPES.includes(formData.reward_type as RewardType)) {
      newErrors.is_stackable = 'Solo los multiplicadores o salvavidas pueden acumularse en inventario';
    }
    if (formData.reward_type === 'token_multiplier') {
      if (!formData.effect_value || formData.effect_value <= 1) {
        newErrors.effect_value = 'El multiplicador debe ser mayor a 1';
      }
      if (!formData.duration_days || formData.duration_days < 1) {
        newErrors.duration_days = 'La duración debe ser mayor o igual a 1 día';
      }
    }
    if (formData.reward_type === 'streak_saver') {
      if (!formData.effect_value || formData.effect_value < 1) {
        newErrors.effect_value = 'Debes indicar cuántos salvavidas entrega';
      }
    }
    if (!formData.start_date) newErrors.start_date = 'La fecha de inicio es requerida';
    if (!formData.finish_date) newErrors.finish_date = 'La fecha de fin es requerida';
    if (formData.start_date && formData.finish_date) {
      if (new Date(formData.finish_date) < new Date(formData.start_date)) {
        newErrors.finish_date = 'La fecha de fin debe ser posterior a la de inicio';
      }
    }

    const requiresEffectValue = ['pase_gratis', 'descuento', 'token_multiplier', 'streak_saver'].includes(
      formData.reward_type
    );
    if (requiresEffectValue && (!formData.effect_value || formData.effect_value <= 0)) {
      newErrors.effect_value = 'El valor del efecto es requerido y debe ser mayor a 0';
    }
    if (formData.reward_type === 'descuento' && formData.effect_value && formData.effect_value > 100) {
      newErrors.effect_value = 'El porcentaje de descuento no puede ser mayor a 100';
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

  // Mapeo de tipos a nombres descriptivos en espaÃ±ol
  const getRewardTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'descuento': 'Descuento',
      'pase_gratis': 'Pase Premium Gratis',
      'producto': 'Producto físico',
      'servicio': 'Servicio especial',
      'merchandising': 'Merchandising',
      'token_multiplier': 'Multiplicador de tokens',
      'streak_saver': 'Protector de racha',
      'otro': 'Otro'
    };
    return labels[type] || type;
  };

  const rewardTypeOptions = REWARD_TYPES.map(type => ({
    value: type,
    label: getRewardTypeLabel(type)
  }));

  // Helper para obtener el placeholder y el label del effect_value según el tipo
  const getEffectValueInfo = () => {
    switch (formData.reward_type) {
      case 'pase_gratis':
        return {
          label: 'Días de premium',
          placeholder: 'Ej: 1, 7, 30',
          description: 'Cantidad de días de suscripción premium que otorga esta recompensa',
        };
      case 'descuento':
        return {
          label: 'Porcentaje de descuento',
          placeholder: 'Ej: 10, 20, 50',
          description: 'Porcentaje de descuento a aplicar (0-100)',
        };
      case 'token_multiplier':
        return {
          label: 'Multiplicador de tokens',
          placeholder: 'Ej: 2, 3.5',
          description: 'Factor que se aplicará al generar tokens (debe ser mayor a 1)',
        };
      case 'streak_saver':
        return {
          label: 'Cantidad de salvavidas',
          placeholder: 'Ej: 1, 2',
          description: 'Unidades que se agregarán al inventario del usuario',
        };
      default:
        return {
          label: 'Valor del efecto',
          placeholder: 'Valor numérico',
          description: 'Valor asociado al efecto de la recompensa (opcional)',
        };
    }
  };
  const effectInfo = getEffectValueInfo();
  const requiresEffectValue = ['pase_gratis', 'descuento', 'token_multiplier', 'streak_saver'].includes(
    formData.reward_type
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          label="Nombre de la recompensa *"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ej: Pase 1 día gratis"
          maxLength={50}
          disabled={isLoading}
          error={errors.name}
        />
        <Select
          label="Tipo de recompensa *"
          name="reward_type"
          value={formData.reward_type}
          onChange={handleChange}
          disabled={isLoading}
          options={rewardTypeOptions}
        />
      </div>

      {/* Campo effect_value - solo para tipos que lo necesitan */}
      {requiresEffectValue && (
        <div className="space-y-1">
          <Input
            label={effectInfo.label + ' *'}
            type="number"
            name="effect_value"
            value={formData.effect_value || ''}
            onChange={handleChange}
            min={1}
            max={formData.reward_type === 'descuento' ? 100 : undefined}
            step={formData.reward_type === 'token_multiplier' ? 0.1 : 1}
            placeholder={effectInfo.placeholder}
            disabled={isLoading}
            error={errors.effect_value}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 ml-1">
            {effectInfo.description}
          </p>
        </div>
      )}

      <Textarea
        label="Descripción *"
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
        label="URL de imagen (opcional)"
        name="image_url"
        value={formData.image_url || ''}
        onChange={handleChange}
        placeholder="https://ejemplo.com/imagen-recompensa.jpg"
        disabled={isLoading}
        error={errors.image_url}
      />

      <Textarea
        label="Términos y condiciones (opcional)"
        name="terms"
        value={formData.terms || ''}
        onChange={handleChange}
        placeholder="Ej: VÃ¡lido de lunes a viernes de 6am a 10pm. No acumulable con otras promociones. Expira 30 días después del canje."
        maxLength={500}
        rows={3}
        disabled={isLoading}
        error={errors.terms}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          label="Costo en tokens *"
          type="number"
          name="cost_tokens"
          value={formData.cost_tokens}
          onChange={handleChange}
          min={0}
          placeholder="50"
          disabled={isLoading}
          error={errors.cost_tokens}
        />
        <Input
          label="Cooldown (días)"
          type="number"
          name="cooldown_days"
          value={formData.cooldown_days ?? 0}
          onChange={handleChange}
          min={0}
          placeholder="30"
          disabled={isLoading}
          error={errors.cooldown_days}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-2 rounded-2xl border border-dashed border-border dark:border-border-dark p-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_unlimited"
              name="is_unlimited"
              checked={formData.is_unlimited ?? false}
              onChange={handleCheckboxChange}
              disabled={isLoading}
              className="h-4 w-4 rounded border-input-border dark:border-input-border-dark bg-input-bg dark:bg-input-bg-dark text-primary focus:ring-primary"
            />
            <label htmlFor="is_unlimited" className="text-sm font-medium text-text dark:text-text-dark">
              Stock ilimitado
            </label>
          </div>
          {formData.is_unlimited ? (
            <p className="text-xs text-text-muted">
              No se descuenta stock al canjear esta recompensa.
            </p>
          ) : (
            <Input
              label="Stock disponible *"
              type="number"
              name="stock"
              value={formData.stock ?? ''}
              onChange={handleChange}
              min={0}
              placeholder="100"
              disabled={isLoading}
              error={errors.stock}
            />
          )}
        </div>

        <div className="space-y-3 rounded-2xl border border-dashed border-border dark:border-border-dark p-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="requires_premium"
              name="requires_premium"
              checked={formData.requires_premium ?? false}
              onChange={handleCheckboxChange}
              disabled={isLoading}
              className="h-4 w-4 rounded border-input-border dark:border-input-border-dark bg-input-bg dark:bg-input-bg-dark text-primary focus:ring-primary"
            />
            <label htmlFor="requires_premium" className="text-sm font-medium text-text dark:text-text-dark">
              Solo usuarios premium
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_stackable"
              name="is_stackable"
              checked={formData.is_stackable ?? false}
              onChange={handleCheckboxChange}
              disabled={isLoading || isStackableForced}
              className="h-4 w-4 rounded border-input-border dark:border-input-border-dark bg-input-bg dark:bg-input-bg-dark text-primary focus:ring-primary"
            />
            <label htmlFor="is_stackable" className="text-sm font-medium text-text dark:text-text-dark">
              Acumulable en inventario
            </label>
          </div>
          {isStackableForced && (
            <p className="text-xs text-text-muted">
              Esta recompensa se guarda en el inventario del usuario automáticamente.
            </p>
          )}
        </div>
      </div>

      {formData.is_stackable && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Máximo acumulable *"
            type="number"
            name="max_stack"
            value={formData.max_stack ?? 1}
            onChange={handleChange}
            min={1}
            placeholder="3"
            disabled={isLoading}
            error={errors.max_stack}
          />
          {formData.reward_type === 'token_multiplier' && (
            <Input
              label="Duración del efecto (días) *"
              type="number"
              name="duration_days"
              value={formData.duration_days ?? 7}
              onChange={handleChange}
              min={1}
              step={1}
              placeholder="7"
              disabled={isLoading}
              error={errors.duration_days}
            />
          )}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Input
          label="Fecha de Inicio *"
          type="date"
          name="start_date"
          value={formData.start_date}
          onChange={handleChange}
          disabled={isLoading}
          error={errors.start_date}
        />
        <Input
          label="Fecha de Fin *"
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
        <label htmlFor="available" className="text-sm font-medium text-text dark:text-text-dark">Disponible para canje</label>
      </div>

      <div className="flex justify-end gap-3 pt-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>Cancelar</Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? 'Guardando...' : reward ? 'Actualizar Recompensa' : 'Crear Recompensa'}
        </Button>
      </div>
    </form>
  );
};







