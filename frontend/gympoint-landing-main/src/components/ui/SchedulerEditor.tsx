import { useState } from 'react';
import { Button } from '../ui/Button';
import { useTheme } from '../../hooks';
import type { DaySchedule } from '../../types/gym.types';
interface ScheduleEditorProps {
  schedule: DaySchedule[];
  onChange: (schedule: DaySchedule[]) => void;
}

type ScheduleMode = 'same' | 'weekend' | 'sat-sun' | 'custom';

export const ScheduleEditor: React.FC<ScheduleEditorProps> = ({ schedule, onChange }) => {
  const [mode, setMode] = useState<ScheduleMode>('same');
  const { theme } = useTheme();

  const applyScheduleMode = (newMode: ScheduleMode, opens: string = '07:00', closes: string = '22:00') => {
    let newSchedule: DaySchedule[];

    switch (newMode) {
      case 'same':
        newSchedule = schedule.map(day => ({
          ...day,
          is_open: true,
          opens,
          closes,
        }));
        break;

      case 'weekend':
        newSchedule = schedule.map((day, i) => ({
          ...day,
          is_open: true,
          opens: i < 5 ? opens : '09:00',
          closes: i < 5 ? closes : '18:00',
        }));
        break;

      case 'sat-sun':
        newSchedule = schedule.map((day, i) => ({
          ...day,
          is_open: true,
          opens: i < 5 ? opens : i === 5 ? '09:00' : '10:00',
          closes: i < 5 ? closes : i === 5 ? '18:00' : '14:00',
        }));
        break;

      case 'custom':
      default:
        newSchedule = schedule;
        break;
    }

    onChange(newSchedule);
    setMode(newMode);
  };

  const updateSchedule = (indices: number[], field: 'opens' | 'closes', value: string) => {
    const newSchedule = [...schedule];
    indices.forEach(index => {
      newSchedule[index] = {
        ...newSchedule[index],
        [field]: value,
      };
    });
    onChange(newSchedule);
  };

  const closeDays = (indices: number[]) => {
    const newSchedule = [...schedule];
    indices.forEach(index => {
      newSchedule[index] = {
        ...newSchedule[index],
        is_open: false,
      };
    });
    onChange(newSchedule);
  };

  const reopenDays = (indices: number[]) => {
    const newSchedule = [...schedule];
    indices.forEach(index => {
      newSchedule[index] = {
        ...newSchedule[index],
        is_open: true,
      };
    });
    onChange(newSchedule);
  };

  const updateDay = (index: number, field: keyof DaySchedule, value: any) => {
    const newSchedule = [...schedule];
    newSchedule[index] = {
      ...newSchedule[index],
      [field]: value,
    };
    onChange(newSchedule);
  };

  const renderScheduleTable = (title: string, indices: number[]) => {
    const allClosed = indices.every(i => !schedule[i].is_open);
    const firstOpenIndex = indices.find(i => schedule[i].is_open) ?? indices[0];

    if (allClosed) {
      return (
        <div className={`p-6 rounded-lg text-center ${
          theme === 'light'
            ? 'border-2 border-gray-300 bg-gray-100'
            : 'border-2 border-gray-600 bg-gray-800'
        }`}>
          <p className={`mb-3 ${
            theme === 'light' ? 'text-gray-700' : 'text-gray-400'
          }`}>
            <span className="font-semibold">{title}</span> - Cerrado
          </p>
          <Button
            type="button"
            onClick={() => reopenDays(indices)}
            className="bg-green-500 hover:bg-green-600 text-white border-0"
            size="sm"
          >
            Reabrir
          </Button>
        </div>
      );
    }

    return (
      <div className={`p-4 rounded-lg ${
        theme === 'light'
          ? 'border-2 border-secondary bg-secondary/5'
          : 'border-2 border-secondary bg-secondary/10'
      }`}>
        <div className="flex justify-between items-center mb-3">
          <h4 className={`font-semibold ${
            theme === 'light' ? 'text-gray-900' : 'text-gray-100'
          }`}>
            {title}
          </h4>
          <Button
            type="button"
            onClick={() => closeDays(indices)}
            className="bg-rose-500 hover:bg-rose-600 text-white border-0"
            size="sm"
          >
            Cerrar
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'light' ? 'text-gray-900' : 'text-gray-100'
            }`}>
              Apertura
            </label>
            <div 
              className="relative cursor-pointer"
              onClick={(e) => {
                const input = e.currentTarget.querySelector('input');
                input?.showPicker?.();
              }}
            >
              <input
                type="time"
                value={schedule[firstOpenIndex].opens}
                onChange={(e) => updateSchedule(indices, 'opens', e.target.value)}
                className={`
                  w-full px-4 py-2.5 rounded-lg border transition-colors cursor-pointer
                  focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent
                  ${theme === 'light'
                    ? 'bg-white text-gray-900 border-gray-300'
                    : 'bg-gray-700 text-gray-100 border-gray-600'
                  }
                `}
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${
              theme === 'light' ? 'text-gray-900' : 'text-gray-100'
            }`}>
              Cierre
            </label>
            <div 
              className="relative cursor-pointer"
              onClick={(e) => {
                const input = e.currentTarget.querySelector('input');
                input?.showPicker?.();
              }}
            >
              <input
                type="time"
                value={schedule[firstOpenIndex].closes}
                onChange={(e) => updateSchedule(indices, 'closes', e.target.value)}
                className={`
                  w-full px-4 py-2.5 rounded-lg border transition-colors cursor-pointer
                  focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent
                  ${theme === 'light'
                    ? 'bg-white text-gray-900 border-gray-300'
                    : 'bg-gray-700 text-gray-100 border-gray-600'
                  }
                `}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <p className={`text-sm font-medium mb-3 ${
          theme === 'light' ? 'text-gray-900' : 'text-gray-100'
        }`}>
          Seleccioná cómo configurar los horarios:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => applyScheduleMode('same')}
            className={`
              p-4 rounded-lg border-2 text-left transition-all
              ${mode === 'same' 
                ? 'border-secondary bg-secondary/10' 
                : theme === 'light'
                  ? 'border-gray-300 hover:border-secondary/50'
                  : 'border-gray-600 hover:border-secondary/50'
              }
            `}
          >
            <div className={`font-semibold ${
              theme === 'light' ? 'text-gray-900' : 'text-gray-100'
            }`}>
              Todos los días mismo horario
            </div>
            <div className={`text-xs mt-1 ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              Configurá una sola vez para toda la semana
            </div>
          </button>

          <button
            type="button"
            onClick={() => applyScheduleMode('weekend')}
            className={`
              p-4 rounded-lg border-2 text-left transition-all
              ${mode === 'weekend' 
                ? 'border-secondary bg-secondary/10' 
                : theme === 'light'
                  ? 'border-gray-300 hover:border-secondary/50'
                  : 'border-gray-600 hover:border-secondary/50'
              }
            `}
          >
            <div className={`font-semibold ${
              theme === 'light' ? 'text-gray-900' : 'text-gray-100'
            }`}>
              Finde semana diferente
            </div>
            <div className={`text-xs mt-1 ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              Lun-Vie un horario, Sáb-Dom otro
            </div>
          </button>

          <button
            type="button"
            onClick={() => applyScheduleMode('sat-sun')}
            className={`
              p-4 rounded-lg border-2 text-left transition-all
              ${mode === 'sat-sun' 
                ? 'border-secondary bg-secondary/10' 
                : theme === 'light'
                  ? 'border-gray-300 hover:border-secondary/50'
                  : 'border-gray-600 hover:border-secondary/50'
              }
            `}
          >
            <div className={`font-semibold ${
              theme === 'light' ? 'text-gray-900' : 'text-gray-100'
            }`}>
              Sábados y Domingos diferente
            </div>
            <div className={`text-xs mt-1 ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              Lun-Vie, Sábado, Domingo con horarios distintos
            </div>
          </button>

          <button
            type="button"
            onClick={() => applyScheduleMode('custom')}
            className={`
              p-4 rounded-lg border-2 text-left transition-all
              ${mode === 'custom' 
                ? 'border-secondary bg-secondary/10' 
                : theme === 'light'
                  ? 'border-gray-300 hover:border-secondary/50'
                  : 'border-gray-600 hover:border-secondary/50'
              }
            `}
          >
            <div className={`font-semibold ${
              theme === 'light' ? 'text-gray-900' : 'text-gray-100'
            }`}>
              Todos los días horarios diferentes
            </div>
            <div className={`text-xs mt-1 ${
              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
            }`}>
              Personalizá cada día individualmente
            </div>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {mode === 'same' && renderScheduleTable('Todos los días (Lun-Dom)', [0, 1, 2, 3, 4, 5, 6])}

        {mode === 'weekend' && (
          <>
            {renderScheduleTable('Lunes a Viernes', [0, 1, 2, 3, 4])}
            {renderScheduleTable('Sábado y Domingo', [5, 6])}
          </>
        )}

        {mode === 'sat-sun' && (
          <>
            {renderScheduleTable('Lunes a Viernes', [0, 1, 2, 3, 4])}
            {renderScheduleTable('Sábado', [5])}
            {renderScheduleTable('Domingo', [6])}
          </>
        )}

        {mode === 'custom' && (
          <div className="space-y-3">
            {schedule.map((day, index) => (
              <div
                key={day.day}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${day.is_open 
                    ? theme === 'light'
                      ? 'border-secondary bg-secondary/5'
                      : 'border-secondary bg-secondary/10'
                    : theme === 'light'
                      ? 'border-gray-300 bg-gray-100'
                      : 'border-gray-600 bg-gray-800'
                  }
                `}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`font-medium capitalize text-lg ${
                    theme === 'light' ? 'text-gray-900' : 'text-gray-100'
                  }`}>
                    {day.day}
                  </span>
                  {day.is_open ? (
                    <Button
                      type="button"
                      onClick={() => updateDay(index, 'is_open', false)}
                      className="bg-rose-500 hover:bg-rose-600 text-white border-0"
                      size="sm"
                    >
                      Cerrar
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={() => updateDay(index, 'is_open', true)}
                      className="bg-green-500 hover:bg-green-600 text-white border-0"
                      size="sm"
                    >
                      Reabrir
                    </Button>
                  )}
                </div>

                {day.is_open ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'light' ? 'text-gray-900' : 'text-gray-100'
                      }`}>
                        Apertura
                      </label>
                      <div 
                        className="relative cursor-pointer"
                        onClick={(e) => {
                          const input = e.currentTarget.querySelector('input');
                          input?.showPicker?.();
                        }}
                      >
                        <input
                          type="time"
                          value={day.opens}
                          onChange={(e) => updateDay(index, 'opens', e.target.value)}
                          className={`
                            w-full px-4 py-2.5 rounded-lg border transition-colors cursor-pointer
                            focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent
                            ${theme === 'light'
                              ? 'bg-white text-gray-900 border-gray-300'
                              : 'bg-gray-700 text-gray-100 border-gray-600'
                            }
                          `}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        theme === 'light' ? 'text-gray-900' : 'text-gray-100'
                      }`}>
                        Cierre
                      </label>
                      <div 
                        className="relative cursor-pointer"
                        onClick={(e) => {
                          const input = e.currentTarget.querySelector('input');
                          input?.showPicker?.();
                        }}
                      >
                        <input
                          type="time"
                          value={day.closes}
                          onChange={(e) => updateDay(index, 'closes', e.target.value)}
                          className={`
                            w-full px-4 py-2.5 rounded-lg border transition-colors cursor-pointer
                            focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent
                            ${theme === 'light'
                              ? 'bg-white text-gray-900 border-gray-300'
                              : 'bg-gray-700 text-gray-100 border-gray-600'
                            }
                          `}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className={`text-center italic ${
                    theme === 'light' ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    Cerrado
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};