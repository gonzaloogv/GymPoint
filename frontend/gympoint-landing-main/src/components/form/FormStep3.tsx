import { Input } from '../ui/Input';
import type { GymFormData } from '../../types/gym.types';
import { AMENITIES } from '../../types/gym.types';
import { CheckboxGroup, ScheduleEditor, TextArea } from '../ui';
import { useTheme } from '../../hooks';

interface FormStep3Props {
  formData: GymFormData;
  updateField: (path: string, value: any) => void;
}

export const FormStep3: React.FC<FormStep3Props> = ({ formData, updateField }) => {
  const { theme } = useTheme();

  return (
    <div className="space-y-8">
      <div>
        <h3 className={`text-lg font-semibold mb-2 text-center ${
          theme === 'light' ? 'text-gray-900' : 'text-gray-100'
        }`}>
          Describí brevemente tu gimnasio
        </h3>
        <p className={`text-sm mb-4 text-center ${
          theme === 'light' ? 'text-gray-700' : 'text-gray-300'
        }`}>
          Contale a tus futuros clientes por qué tu gimnasio es la mejor opción.
        </p>
        <div className="flex justify-center">
          <div className="w-full lg:w-3/4">
            <TextArea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Ej: Gimnasio moderno con todas las comodidades. Contamos con entrenadores certificados, clases grupales y un ambiente motivador para alcanzar tus objetivos."
              helperText=""
              maxLength={500}
            />
            <p className={`text-xs text-right mt-1 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {formData.description.length}/500 caracteres
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className={`text-lg font-semibold mb-2 ${
          theme === 'light' ? 'text-gray-900' : 'text-gray-100'
        }`}>
          Días y Horarios de Atención
        </h3>
        <p className={`text-sm mb-4 ${
          theme === 'light' ? 'text-gray-700' : 'text-gray-300'
        }`}>
          Configurá los días y horarios en que tu gimnasio está abierto.
        </p>
        <ScheduleEditor
          schedule={formData.schedule}
          onChange={(schedule) => updateField('schedule', schedule)}
        />
      </div>

      <div>
        <CheckboxGroup
          label="¿Qué servicios adicionales ofrecen?"
          options={AMENITIES}
          selectedValues={formData.amenities}
          onChange={(values) => updateField('amenities', values)}
          helperText="Seleccioná todos los servicios que tu gimnasio ofrece"
        />
      </div>

      <div>
        <h3 className={`text-lg font-semibold mb-2 ${
          theme === 'light' ? 'text-gray-900' : 'text-gray-100'
        }`}>
          Conectá con tu comunidad
        </h3>
        <p className={`text-sm mb-4 ${
          theme === 'light' ? 'text-gray-700' : 'text-gray-300'
        }`}>
          Agregá tus redes sociales para que los usuarios puedan seguirte.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Instagram"
            type="text"
            value={formData.contact.social_media.instagram}
            onChange={(e) => updateField('contact.social_media.instagram', e.target.value)}
            placeholder="fitcenternorte"
            helperText="Solo el nombre de usuario (sin @)"
          />
          <Input
            label="Facebook"
            type="text"
            value={formData.contact.social_media.facebook}
            onChange={(e) => updateField('contact.social_media.facebook', e.target.value)}
            placeholder="FitCenterNorteOK"
            helperText="Nombre de la página"
          />
        </div>
      </div>

      <div className={`p-4 rounded-lg ${
        theme === 'light' 
          ? 'bg-purple-100 border border-purple-300' 
          : 'bg-purple-900/30 border border-purple-700'
      }`}>
        <p className={`text-sm ${
          theme === 'light' ? 'text-purple-900' : 'text-purple-200'
        }`}>
          🎉 <strong>¡Casi listo!</strong> Esta información complementaria ayuda a crear
          un perfil completo y atractivo para tu gimnasio.
        </p>
      </div>
    </div>
  );
};