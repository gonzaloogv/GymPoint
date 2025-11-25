import { useState } from 'react';
import { Input, Button } from '../index';
import { EquipmentByCategory, EquipmentItem } from '@/domain/entities/Gym';
import { FaTrash, FaPlus, FaChevronDown, FaChevronRight } from 'react-icons/fa';

interface GymFormEquipmentProps {
  equipment: EquipmentByCategory;
  onUpdateEquipment: (equipment: EquipmentByCategory) => void;
}

export const GymFormEquipment = ({ equipment, onUpdateEquipment }: GymFormEquipmentProps) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newItemName, setNewItemName] = useState<Record<string, string>>({});
  const [newItemQuantity, setNewItemQuantity] = useState<Record<string, string>>({});

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const addCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed || equipment[trimmed]) return;
    onUpdateEquipment({ ...equipment, [trimmed]: [] });
    setNewCategoryName('');
    setExpandedCategories([...expandedCategories, trimmed]);
  };

  const removeCategory = (category: string) => {
    const newEquipment = { ...equipment };
    delete newEquipment[category];
    onUpdateEquipment(newEquipment);
    setExpandedCategories(expandedCategories.filter(c => c !== category));
  };

  const addItem = (category: string) => {
    const name = newItemName[category]?.trim();
    const quantityStr = newItemQuantity[category]?.trim();
    const quantity = parseInt(quantityStr || '1');

    if (!name || !quantity || quantity < 1) return;

    const newEquipment = { ...equipment };
    newEquipment[category] = [
      ...(newEquipment[category] || []),
      { name, quantity }
    ];
    onUpdateEquipment(newEquipment);

    // Limpiar inputs
    setNewItemName({ ...newItemName, [category]: '' });
    setNewItemQuantity({ ...newItemQuantity, [category]: '' });
  };

  const removeItem = (category: string, itemIndex: number) => {
    const newEquipment = { ...equipment };
    newEquipment[category] = newEquipment[category].filter((_, i) => i !== itemIndex);
    onUpdateEquipment(newEquipment);
  };

  const updateItemQuantity = (category: string, itemIndex: number, quantity: number) => {
    if (quantity < 1) return;
    const newEquipment = { ...equipment };
    newEquipment[category][itemIndex] = {
      ...newEquipment[category][itemIndex],
      quantity
    };
    onUpdateEquipment(newEquipment);
  };

  const suggestedCategories = [
    { name: 'Fuerza', icon: '🏋️' },
    { name: 'Cardio', icon: '🏃' },
    { name: 'Funcional', icon: '🤸' },
    { name: 'Máquinas', icon: '⚙️' },
    { name: 'Pesas libres', icon: '💪' },
  ];

  const categories = Object.keys(equipment);
  const totalItems = categories.reduce((sum, cat) => sum + (equipment[cat]?.length || 0), 0);

  return (
    <div className="space-y-4 p-6 bg-card dark:bg-card-dark rounded-xl border border-border dark:border-border-dark transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-text dark:text-text-dark">Equipamiento por categoría</h3>
          <p className="text-xs text-text-muted mt-1">Organiza el equipamiento en categorías con cantidades</p>
        </div>
        <span className="text-xs text-text-muted bg-bg dark:bg-bg-dark px-3 py-1 rounded-full">
          {categories.length} {categories.length === 1 ? 'categoría' : 'categorías'} · {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Agregar nueva categoría */}
      <div className="space-y-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            label="Nueva categoría"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
            placeholder="Ej: Fuerza, Cardio, Funcional..."
            className="flex-1"
          />
          <Button
            type="button"
            variant="primary"
            onClick={addCategory}
            className="sm:w-auto w-full px-4 py-2 text-sm transition-transform duration-200 hover:scale-105"
          >
            <FaPlus size={14} className="mr-2" />
            Crear categoría
          </Button>
        </div>

        {/* Categorías sugeridas */}
        <div className="flex flex-wrap gap-2">
          {suggestedCategories
            .filter(s => !equipment[s.name])
            .map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => {
                  setNewCategoryName(cat.name);
                  onUpdateEquipment({ ...equipment, [cat.name]: [] });
                  setExpandedCategories([...expandedCategories, cat.name]);
                }}
                className="px-3 py-1 text-xs rounded-full border border-border dark:border-border-dark text-text-muted hover:bg-primary hover:text-white hover:border-primary transition-all duration-200 hover:scale-105"
              >
                {cat.icon} + {cat.name}
              </button>
            ))}
        </div>
      </div>

      {/* Lista de categorías */}
      {categories.length > 0 ? (
        <div className="space-y-3">
          {categories.map((category) => {
            const isExpanded = expandedCategories.includes(category);
            const items = equipment[category] || [];

            return (
              <div
                key={category}
                className="border border-border dark:border-border-dark rounded-lg overflow-hidden transition-all duration-200 hover:shadow-sm"
              >
                {/* Categoría header */}
                <div className="flex items-center justify-between p-4 bg-bg dark:bg-bg-dark">
                  <button
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className="flex items-center gap-2 flex-1 text-left group"
                  >
                    {isExpanded ? <FaChevronDown size={18} /> : <FaChevronRight size={18} />}
                    <span className="font-semibold text-text dark:text-text-dark capitalize group-hover:text-primary transition-colors">
                      {category}
                    </span>
                    <span className="text-xs text-text-muted ml-2">
                      ({items.length} {items.length === 1 ? 'item' : 'items'})
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCategory(category)}
                    className="p-2 text-danger hover:bg-danger/10 rounded transition-all duration-200"
                    title="Eliminar categoría"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>

                {/* Categoría contenido (expandible) */}
                {isExpanded && (
                  <div className="p-4 space-y-3 bg-card dark:bg-card-dark animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Agregar nuevo item */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
                      <div className="flex-1">
                        <Input
                          label="Nombre del equipo"
                          value={newItemName[category] || ''}
                          onChange={(e) => setNewItemName({ ...newItemName, [category]: e.target.value })}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(category))}
                          placeholder="Ej: Banco press, Cinta de correr..."
                        />
                      </div>
                      <div className="w-full sm:w-24">
                        <Input
                          label="Cantidad"
                          type="number"
                          min="1"
                          value={newItemQuantity[category] || ''}
                          onChange={(e) => setNewItemQuantity({ ...newItemQuantity, [category]: e.target.value })}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(category))}
                          placeholder="1"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => addItem(category)}
                        className="w-full sm:w-12 px-4 py-[0.85rem] border border-transparent bg-primary dark:bg-primary-dark text-white rounded-lg hover:bg-primary/90 dark:hover:bg-primary-dark/90 flex items-center justify-center transition-all duration-200 hover:scale-105"
                      >
                        <FaPlus size={18} className="text-white" />
                      </button>
                    </div>

                    {/* Lista de items */}
                    {items.length > 0 ? (
                      <ul className="space-y-2">
                        {items.map((item, index) => (
                          <li
                            key={`${category}-${index}`}
                            className="flex items-center justify-between p-3 bg-bg dark:bg-bg-dark rounded-lg group hover:shadow-sm transition-all duration-200"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-2 h-2 rounded-full bg-primary"></div>
                              <span className="text-sm text-text dark:text-text-dark font-medium">{item.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(category, index, parseInt(e.target.value) || 1)}
                                className="w-16 px-2 py-1 text-sm text-center rounded border border-border dark:border-border-dark bg-card dark:bg-card-dark"
                              />
                              <button
                                type="button"
                                onClick={() => removeItem(category, index)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-danger hover:bg-danger/10 rounded transition-all duration-200"
                              >
                                <FaTrash size={14} />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-center text-text-muted py-4">
                        No hay equipos en esta categoría. Agrega el primer item arriba.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-text-muted text-sm border-2 border-dashed border-border dark:border-border-dark rounded-lg">
          <span className="text-4xl mb-3 block">🏋️</span>
          <p className="font-medium">No hay categorías de equipamiento</p>
          <p className="text-xs mt-1">Crea una categoría para empezar a agregar equipos</p>
        </div>
      )}
    </div>
  );
};
