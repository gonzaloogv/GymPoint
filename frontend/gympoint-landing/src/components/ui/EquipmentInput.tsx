import React, { useState } from 'react';
import { useTheme } from '../../hooks';
import { FaChevronDown, FaChevronRight, FaPlus, FaTrash } from 'react-icons/fa';

interface EquipmentInputProps {
  value: Record<string, Array<{ name: string; quantity: number }>>;
  onChange: (equipment: Record<string, Array<{ name: string; quantity: number }>>) => void;
}

export const EquipmentInput: React.FC<EquipmentInputProps> = ({ value, onChange }) => {
  const { theme } = useTheme();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newItemName, setNewItemName] = useState<Record<string, string>>({});
  const [newItemQuantity, setNewItemQuantity] = useState<Record<string, string>>({});

  const suggestedCategories = [
    { name: 'Fuerza', icon: '🏋️' },
    { name: 'Cardio', icon: '🏃' },
    { name: 'Funcional', icon: '🤸' },
    { name: 'Máquinas', icon: '⚙️' },
    { name: 'Pesas libres', icon: '💪' },
  ];

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const addCategory = () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed || value[trimmed]) return;
    onChange({ ...value, [trimmed]: [] });
    setNewCategoryName('');
    setExpandedCategories([...expandedCategories, trimmed]);
  };

  const removeCategory = (category: string) => {
    const newEquipment = { ...value };
    delete newEquipment[category];
    onChange(newEquipment);
    setExpandedCategories(expandedCategories.filter((c) => c !== category));
  };

  const addItem = (category: string) => {
    const name = newItemName[category]?.trim();
    const quantityStr = newItemQuantity[category]?.trim();
    const quantity = parseInt(quantityStr || '1');

    if (!name || !quantity || quantity < 1) return;

    const newEquipment = { ...value };
    newEquipment[category] = [...(newEquipment[category] || []), { name, quantity }];
    onChange(newEquipment);

    setNewItemName({ ...newItemName, [category]: '' });
    setNewItemQuantity({ ...newItemQuantity, [category]: '' });
  };

  const removeItem = (category: string, itemIndex: number) => {
    const newEquipment = { ...value };
    newEquipment[category] = newEquipment[category].filter((_, i) => i !== itemIndex);
    onChange(newEquipment);
  };

  const categories = Object.keys(value);
  const totalItems = categories.reduce((sum, cat) => sum + (value[cat]?.length || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className={`block text-sm font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
          Equipamiento por categoría
        </label>
        <span
          className={`text-xs px-3 py-1 rounded-full ${
            theme === 'light' ? 'bg-gray-100 text-gray-600' : 'bg-gray-800 text-gray-400'
          }`}
        >
          {categories.length} {categories.length === 1 ? 'categoría' : 'categorías'} · {totalItems}{' '}
          {totalItems === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Agregar nueva categoría */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCategory())}
          placeholder="Nueva categoría (ej: Fuerza, Cardio...)"
          className={`
            flex-1 px-4 py-2 rounded-lg border-2 transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
            ${
              theme === 'light'
                ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                : 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500'
            }
          `}
        />
        <button
          type="button"
          onClick={addCategory}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 hover:scale-105 flex items-center gap-2"
        >
          <FaPlus size={16} />
          Crear
        </button>
      </div>

      {/* Sugerencias de categorías */}
      {suggestedCategories.filter((s) => !value[s.name]).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestedCategories
            .filter((s) => !value[s.name])
            .map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => {
                  onChange({ ...value, [cat.name]: [] });
                  setExpandedCategories([...expandedCategories, cat.name]);
                }}
                className={`
                  px-3 py-1 text-xs rounded-full border transition-all duration-200 hover:scale-105
                  ${
                    theme === 'light'
                      ? 'bg-white border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-500'
                      : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-green-900/30 hover:border-green-600'
                  }
                `}
              >
                {cat.icon} + {cat.name}
              </button>
            ))}
        </div>
      )}

      {/* Lista de categorías */}
      {categories.length > 0 ? (
        <div className="space-y-3">
          {categories.map((category) => {
            const isExpanded = expandedCategories.includes(category);
            const items = value[category] || [];

            return (
              <div
                key={category}
                className={`
                  border-2 rounded-lg overflow-hidden transition-all duration-200
                  ${
                    theme === 'light'
                      ? 'border-gray-300 bg-white hover:shadow-md'
                      : 'border-gray-700 bg-gray-800 hover:shadow-lg'
                  }
                `}
              >
                {/* Header */}
                <div
                  className={`
                    flex items-center justify-between p-4
                    ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-900/50'}
                  `}
                >
                  <button
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className={`flex items-center gap-2 flex-1 text-left ${theme === 'light' ? 'text-gray-900' : 'text-gray-100'}`}
                  >
                    {isExpanded ? <FaChevronDown size={18} /> : <FaChevronRight size={18} />}
                    <span className="font-semibold capitalize">{category}</span>
                    <span className={`text-xs ml-2 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                      ({items.length} {items.length === 1 ? 'item' : 'items'})
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeCategory(category)}
                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all duration-200"
                  >
                    <FaTrash size={16} />
                  </button>
                </div>

                {/* Contenido expandible */}
                {isExpanded && (
                  <div className="p-4 space-y-3">
                    {/* Agregar nuevo item */}
                    <div className="grid grid-cols-12 gap-2">
                      <input
                        type="text"
                        value={newItemName[category] || ''}
                        onChange={(e) => setNewItemName({ ...newItemName, [category]: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(category))}
                        placeholder="Nombre del equipo"
                        className={`
                          col-span-7 px-3 py-2 rounded border text-sm
                          ${theme === 'light' ? 'border-gray-300 bg-white text-gray-900 placeholder-gray-400' : 'border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-500'}
                        `}
                      />
                      <input
                        type="number"
                        min="1"
                        value={newItemQuantity[category] || ''}
                        onChange={(e) => setNewItemQuantity({ ...newItemQuantity, [category]: e.target.value })}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem(category))}
                        placeholder="Cant."
                        className={`
                          col-span-3 px-3 py-2 rounded border text-sm
                          ${theme === 'light' ? 'border-gray-300 bg-white text-gray-900 placeholder-gray-400' : 'border-gray-600 bg-gray-700 text-gray-100 placeholder-gray-500'}
                        `}
                      />
                      <button
                        type="button"
                        onClick={() => addItem(category)}
                        className="col-span-2 bg-green-600 text-white rounded hover:bg-green-700 transition-all duration-200 hover:scale-105"
                      >
                        <FaPlus size={16} className="mx-auto" />
                      </button>
                    </div>

                    {/* Items */}
                    {items.length > 0 ? (
                      <ul className="space-y-2">
                        {items.map((item, index) => (
                          <li
                            key={`${category}-${index}`}
                            className={`
                              group flex items-center justify-between p-3 rounded transition-all duration-200 hover:shadow-sm
                              ${theme === 'light' ? 'bg-gray-50' : 'bg-gray-900/50'}
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <span className={`font-medium ${theme === 'light' ? 'text-gray-900' : 'text-gray-100'}`}>{item.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>×{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => removeItem(category, index)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all duration-200"
                              >
                                <FaTrash size={14} />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className={`text-xs text-center py-4 ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
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
        <div
          className={`
            text-center py-12 border-2 border-dashed rounded-lg
            ${theme === 'light' ? 'border-gray-300 text-gray-400' : 'border-gray-700 text-gray-500'}
          `}
        >
          <span className="text-4xl mb-3 block">🏋️</span>
          <p className="font-medium">No hay categorías de equipamiento</p>
          <p className="text-xs mt-1">Crea una categoría para empezar a agregar equipos</p>
        </div>
      )}
    </div>
  );
};
