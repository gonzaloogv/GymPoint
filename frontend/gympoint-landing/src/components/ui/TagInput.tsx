import React, { useState } from 'react';
import { useTheme } from '../../hooks';

interface TagInputProps {
  label: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  helperText?: string;
  suggestions?: string[];
  maxTags?: number;
}

export const TagInput: React.FC<TagInputProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Escribe y presiona Enter',
  helperText,
  suggestions = [],
  maxTags,
}) => {
  const { theme } = useTheme();
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (maxTags && value.length >= maxTags) return;
      if (!value.includes(inputValue.trim())) {
        onChange([...value, inputValue.trim()]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const addSuggestion = (suggestion: string) => {
    if (maxTags && value.length >= maxTags) return;
    if (!value.includes(suggestion)) {
      onChange([...value, suggestion]);
    }
  };

  const availableSuggestions = suggestions.filter((s) => !value.includes(s));

  return (
    <div className="space-y-3">
      <label className={`block text-sm font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
        {label}
      </label>

      {/* Input */}
      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`
            w-full px-4 py-3 rounded-lg border-2 transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
            ${
              theme === 'light'
                ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 hover:border-gray-400'
                : 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500 hover:border-gray-600'
            }
          `}
          disabled={maxTags ? value.length >= maxTags : false}
        />
        {maxTags && (
          <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
            {value.length}/{maxTags}
          </span>
        )}
      </div>

      {/* Sugerencias */}
      {availableSuggestions.length > 0 && (
        <div className="space-y-2">
          <p className={`text-xs font-medium ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
            Sugerencias:
          </p>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => addSuggestion(suggestion)}
                className={`
                  px-3 py-1 text-xs rounded-full border transition-all duration-200
                  hover:scale-105 hover:shadow-md
                  ${
                    theme === 'light'
                      ? 'bg-white border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-500 hover:text-green-700'
                      : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-green-900/30 hover:border-green-600 hover:text-green-400'
                  }
                `}
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tags agregados */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag, index) => (
            <div
              key={`${tag}-${index}`}
              className={`
                group flex items-center gap-2 px-4 py-2 rounded-full
                transition-all duration-200 hover:shadow-md hover:scale-105
                ${
                  theme === 'light'
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-green-900/40 text-green-300 border border-green-700'
                }
              `}
            >
              <span className="font-medium">✓ {tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className={`
                  opacity-0 group-hover:opacity-100 transition-opacity duration-200
                  text-xs hover:underline
                  ${theme === 'light' ? 'text-red-600' : 'text-red-400'}
                `}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {helperText && (
        <p className={`text-xs ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
          {helperText}
        </p>
      )}

      {value.length === 0 && (
        <div
          className={`
            text-center py-8 border-2 border-dashed rounded-lg
            ${theme === 'light' ? 'border-gray-300 text-gray-400' : 'border-gray-700 text-gray-500'}
          `}
        >
          <p className="text-sm">No hay items agregados. Agrega al menos uno.</p>
        </div>
      )}
    </div>
  );
};
