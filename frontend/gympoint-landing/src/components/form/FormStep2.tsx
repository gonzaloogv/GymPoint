import { Input } from '../ui/Input';
import type { GymFormData } from '../../types/gym.types';
import { TRAINING_TYPES } from '../../types/gym.types';
import { useTheme } from '../../hooks';
import { PhotoUploader, TagInput, EquipmentInput } from '../ui';

interface FormStep2Props {
  formData: GymFormData;
  updateField: (path: string, value: any) => void;
}

export const FormStep2: React.FC<FormStep2Props> = ({ formData, updateField }) => {
  const { theme } = useTheme();

  return (
    <div className="space-y-8">
      {/* Fotos */}
      <div>
        <h3 className={`text-lg font-semibold mb-2 ${
          theme === 'light' ? 'text-gray-900' : 'text-gray-100'
        }`}>
          Mostrá tus instalaciones
        </h3>
        <p className={`text-sm mb-4 ${
          theme === 'light' ? 'text-gray-700' : 'text-gray-300'
        }`}>
          Las fotos ayudan a los usuarios a conocer tu gimnasio antes de visitarlo.
        </p>
        <PhotoUploader
          photos={formData.attributes.photos}
          onPhotosChange={(photos) => updateField('attributes.photos', photos)}
          maxPhotos={10}
        />
      </div>

      {/* Servicios/Tipos de Entrenamiento */}
      <div className={`p-6 rounded-xl border-2 transition-all duration-200 ${
        theme === 'light'
          ? 'bg-white border-gray-200 hover:border-green-400 hover:shadow-lg'
          : 'bg-gray-800 border-gray-700 hover:border-green-600 hover:shadow-xl'
      }`}>
        <h3 className={`text-lg font-semibold mb-2 ${
          theme === 'light' ? 'text-gray-900' : 'text-gray-100'
        }`}>
          ¿Qué servicios/tipos de entrenamiento ofrecen?
        </h3>
        <p className={`text-sm mb-4 ${
          theme === 'light' ? 'text-gray-700' : 'text-gray-300'
        }`}>
          Agregá los tipos de entrenamiento que ofrecés en tu gimnasio.
        </p>
        <TagInput
          label="Servicios"
          value={formData.attributes.services}
          onChange={(services) => updateField('attributes.services', services)}
          placeholder="Ej: Funcional, CrossFit, Musculación..."
          helperText="Escribí el servicio y presioná Enter para agregarlo"
          suggestions={Array.from(TRAINING_TYPES)}
        />
      </div>

      {/* Equipamiento categorizado */}
      <div className={`p-6 rounded-xl border-2 transition-all duration-200 ${
        theme === 'light'
          ? 'bg-white border-gray-200 hover:border-green-400 hover:shadow-lg'
          : 'bg-gray-800 border-gray-700 hover:border-green-600 hover:shadow-xl'
      }`}>
        <h3 className={`text-lg font-semibold mb-2 ${
          theme === 'light' ? 'text-gray-900' : 'text-gray-100'
        }`}>
          ¿Qué equipamiento tienen disponible?
        </h3>
        <p className={`text-sm mb-4 ${
          theme === 'light' ? 'text-gray-700' : 'text-gray-300'
        }`}>
          Organizá tu equipamiento por categorías (Fuerza, Cardio, etc.) con las cantidades disponibles.
        </p>
        <EquipmentInput
          value={formData.attributes.equipment}
          onChange={(equipment) => updateField('attributes.equipment', equipment)}
        />
      </div>

      {/* Reglas del gimnasio */}
      <div className={`p-6 rounded-xl border-2 transition-all duration-200 ${
        theme === 'light'
          ? 'bg-white border-gray-200 hover:border-green-400 hover:shadow-lg'
          : 'bg-gray-800 border-gray-700 hover:border-green-600 hover:shadow-xl'
      }`}>
        <h3 className={`text-lg font-semibold mb-2 ${
          theme === 'light' ? 'text-gray-900' : 'text-gray-100'
        }`}>
          Reglas de convivencia
        </h3>
        <p className={`text-sm mb-4 ${
          theme === 'light' ? 'text-gray-700' : 'text-gray-300'
        }`}>
          Agregá las reglas importantes que los usuarios deben seguir en tu gimnasio.
        </p>
        <TagInput
          label="Reglas"
          value={formData.attributes.rules}
          onChange={(rules) => updateField('attributes.rules', rules)}
          placeholder="Ej: Llevar toalla, Limpiar máquinas después de usar..."
          helperText="Escribí la regla y presioná Enter para agregarla"
          suggestions={[
            'Llevar toalla',
            'Limpiar máquinas después de usar',
            'Uso obligatorio de calzado deportivo',
            'Respetar el horario de reserva',
            'No usar celular en el área de entrenamiento',
            'Devolver el equipamiento a su lugar',
          ]}
          maxTags={10}
        />
      </div>

      {/* Precios */}
      <div>
        <h3 className={`text-lg font-semibold mb-2 ${
          theme === 'light' ? 'text-gray-900' : 'text-gray-100'
        }`}>
          ¿Cuáles son sus precios?
        </h3>
        <p className={`text-sm mb-4 ${
          theme === 'light' ? 'text-gray-700' : 'text-gray-300'
        }`}>
          Esta información es muy valorada por los usuarios y mejora tu posicionamiento.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Cuota Mensual"
            type="number"
            value={formData.pricing.monthly || ''}
            onChange={(e) => updateField('pricing.monthly', e.target.value ? Number(e.target.value) : null)}
            placeholder="18000"
            helperText="Precio en pesos"
          />
          <Input
            label="Pase Semanal"
            type="number"
            value={formData.pricing.weekly || ''}
            onChange={(e) => updateField('pricing.weekly', e.target.value ? Number(e.target.value) : null)}
            placeholder="6000"
            helperText="Precio en pesos"
          />
          <Input
            label="Pase Diario"
            type="number"
            value={formData.pricing.daily || ''}
            onChange={(e) => updateField('pricing.daily', e.target.value ? Number(e.target.value) : null)}
            placeholder="2500"
            helperText="Precio en pesos"
          />
        </div>
      </div>

      {/* Nota */}
      <div className={`p-4 rounded-lg ${
        theme === 'light'
          ? 'bg-green-100 border border-green-300'
          : 'bg-green-900/30 border border-green-700'
      }`}>
        <p className={`text-sm ${
          theme === 'light' ? 'text-green-900' : 'text-green-200'
        }`}>
          ℹ️ <strong>Información opcional:</strong> Toda la información de este paso es opcional,
          pero completarla aumenta significativamente las probabilidades de que un usuario elija tu gimnasio.
        </p>
      </div>
    </div>
  );
};
