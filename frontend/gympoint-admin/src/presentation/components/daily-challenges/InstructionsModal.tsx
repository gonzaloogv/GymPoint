import { Modal } from '../ui';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal = ({ isOpen, onClose }: InstructionsModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cómo funciona el sistema de Desafíos Diarios">
      <div className="space-y-6">
        {/* Concepto General */}
        <section>
          <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">
            📊 Concepto General
          </h3>
          <p className="text-text-muted leading-relaxed">
            El sistema de Desafíos Diarios motiva a los usuarios a cumplir metas diarias
            y los recompensa con tokens. Cada día puede tener UN solo desafío activo.
          </p>
        </section>

        {/* Plantillas */}
        <section>
          <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">
            📋 Plantillas (Templates)
          </h3>
          <div className="space-y-2 text-text-muted">
            <p>
              <strong>¿Qué son?</strong> Son modelos reutilizables de desafíos que NO tienen
              fecha asignada.
            </p>
            <p>
              <strong>¿Para qué sirven?</strong> Se usan para GENERAR automáticamente desafíos
              cada día sin tener que crearlos manualmente.
            </p>
            <p>
              <strong>Peso de rotación:</strong> Define la probabilidad de que una plantilla sea
              seleccionada. Ejemplo: peso 3 tiene triple probabilidad que peso 1.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mt-2">
              <p className="text-sm">
                <strong>💡 Ejemplo:</strong> Creas 3 plantillas:
                <br />• "Entrena 30 minutos" (peso: 2)
                <br />• "Completa 5 ejercicios" (peso: 1)
                <br />• "Visita el gym 1 vez" (peso: 3)
                <br />
                <br />El sistema selecciona aleatoriamente una cada día, siendo "Visita el gym"
                3 veces más probable que "Completa 5 ejercicios".
              </p>
            </div>
          </div>
        </section>

        {/* Desafíos */}
        <section>
          <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">
            🎯 Desafíos (Daily Challenges)
          </h3>
          <div className="space-y-2 text-text-muted">
            <p>
              <strong>¿Qué son?</strong> Son desafíos concretos asignados a una FECHA específica.
            </p>
            <p>
              <strong>Tipos de desafíos:</strong>
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>
                <strong>Manuales:</strong> Los creas tú directamente con el formulario
                "Crear desafío manual".
              </li>
              <li>
                <strong>Auto-generados:</strong> El sistema los crea automáticamente desde las
                plantillas activas.
              </li>
            </ul>
            <p className="mt-2">
              <strong>Importante:</strong> Solo puede existir 1 desafío por fecha. Si creas uno
              manual para hoy, el sistema NO generará uno automático.
            </p>
          </div>
        </section>

        {/* Rotación Automática */}
        <section>
          <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">
            🔄 Rotación Automática
          </h3>
          <div className="space-y-2 text-text-muted">
            <p>
              <strong>¿Qué es?</strong> Es un proceso automático que se ejecuta según el horario
              configurado (por defecto 00:01 UTC).
            </p>
            <p>
              <strong>¿Qué hace?</strong>
            </p>
            <ol className="list-decimal list-inside ml-4 space-y-1">
              <li>Verifica si ya existe un desafío para HOY</li>
              <li>Si NO existe, selecciona una plantilla activa al azar (considerando el peso)</li>
              <li>Crea un nuevo desafío basado en esa plantilla</li>
            </ol>
            <p className="mt-2">
              <strong>Activar/Desactivar:</strong> Puedes activar o desactivar este proceso desde
              la "Configuración General".
            </p>
            <p>
              <strong>Ejecutar ahora:</strong> El botón "Ejecutar rotación ahora" fuerza la
              ejecución inmediata (útil para probar o asegurar que hoy hay un desafío).
            </p>
          </div>
        </section>

        {/* Configuración */}
        <section>
          <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">
            ⚙️ Configuración General
          </h3>
          <div className="space-y-2 text-text-muted">
            <p>
              <strong>Rotación automática:</strong> Activa/desactiva el proceso automático.
            </p>
            <p>
              <strong>Hora de ejecución (UTC):</strong> Define a qué hora se ejecuta el proceso
              cada día. Por defecto 00:01 UTC (equivale a 21:01 hora argentina).
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-2">
              <p className="text-sm">
                <strong>⚠️ Nota:</strong> El horario está en UTC. Para Argentina (UTC-3), resta
                3 horas. Ejemplo: 00:01 UTC = 21:01 Argentina.
              </p>
            </div>
          </div>
        </section>

        {/* Flujo Recomendado */}
        <section className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-text dark:text-text-dark mb-2">
            ✅ Flujo Recomendado
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-text-muted">
            <li>
              <strong>Crea plantillas:</strong> Define 5-10 plantillas variadas con diferentes
              dificultades y pesos.
            </li>
            <li>
              <strong>Activa la rotación:</strong> En "Configuración General", asegúrate que
              esté activa.
            </li>
            <li>
              <strong>Prueba:</strong> Usa "Ejecutar rotación ahora" para verificar que funciona.
            </li>
            <li>
              <strong>Monitora:</strong> Revisa la lista de "Desafíos programados" para ver los
              desafíos generados.
            </li>
            <li>
              <strong>Opcional:</strong> Crea desafíos manuales para fechas especiales (eventos,
              días festivos, etc.).
            </li>
          </ol>
        </section>
      </div>

      <div className="flex justify-end mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Entendido
        </button>
      </div>
    </Modal>
  );
};
