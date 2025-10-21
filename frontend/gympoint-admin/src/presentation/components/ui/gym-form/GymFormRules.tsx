import { useState } from 'react';
import { Input, Button } from '../index';

interface GymFormRulesProps {
  rules: string[];
  onAddRule: (rule: string) => void;
  onRemoveRule: (index: number) => void;
}

export const GymFormRules = ({ rules, onAddRule, onRemoveRule }: GymFormRulesProps) => {
  const [draftRule, setDraftRule] = useState('');

  const handleAddRule = () => {
    const trimmed = draftRule.trim();
    if (!trimmed) return;
    onAddRule(trimmed);
    setDraftRule('');
  };

  return (
    <div className="space-y-4 p-6 bg-card dark:bg-card-dark rounded-xl border border-border dark:border-border-dark">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text dark:text-text-dark">Reglas de convivencia</h3>
        <span className="text-xs text-text-muted">Agrega reglas breves y claras</span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          label="Nueva regla"
          value={draftRule}
          onChange={(event) => setDraftRule(event.target.value)}
          placeholder="Ej: Llevar toalla, limpiar máquinas..."
          className="flex-1"
        />
        <Button type="button" variant="primary" onClick={handleAddRule} className="self-end">
          Agregar
        </Button>
      </div>

      {rules.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {rules.map((rule, index) => (
            <li
              key={`${rule}-${index}`}
              className="flex items-center gap-2 rounded-full bg-bg px-3 py-1 text-sm text-text dark:bg-bg-dark dark:text-text-dark"
            >
              <span>{rule}</span>
              <button
                type="button"
                onClick={() => onRemoveRule(index)}
                className="text-xs text-danger hover:underline"
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
