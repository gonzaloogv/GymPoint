import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useGymForm, useGymFormSubmit, useTheme } from '../hooks';
import { Button, Heading, ThemeSwitcher } from '../components/ui';
import { FormStep1, FormStep2, FormStep3 } from '../components/form';

export const RegisterGymPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const {
    formData,
    updateField,
    currentStep,
    setCurrentStep,
    isStep1Complete,
    clearDraft,
  } = useGymForm();

  const {
    isSubmitting,
    submitStatus,
    errorMessage,
    submitToWeb3Forms,
    resetSubmitStatus,
  } = useGymFormSubmit();

  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinish = async () => {
    if (!isStep1Complete()) {
      setShowWarningModal(true);
      return;
    }

    const success = await submitToWeb3Forms(formData);

    if (success) {
      setShowSuccessModal(true);
      clearDraft();
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    resetSubmitStatus();
    navigate('/');
  };

  return (
    <div className={`min-h-screen py-12 px-4 ${
      theme === 'light' ? 'bg-gray-50' : 'bg-gray-900'
    }`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div className="flex-1 text-center">
            <Heading variant="h1" className="mb-4">
              Registrá tu Gimnasio
            </Heading>
            <p className={`${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Paso {currentStep} de {totalSteps}
            </p>
          </div>
          <div className="ml-4">
            <ThemeSwitcher />
          </div>
        </div>

        <div className="mb-8">
          <div className="flex gap-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  step <= currentStep
                    ? 'bg-secondary'
                    : theme === 'light' 
                      ? 'bg-gray-300' 
                      : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        <div className={`rounded-lg shadow-lg p-8 mb-8 ${
          theme === 'light' ? 'bg-white' : 'bg-gray-800'
        }`}>
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Heading variant="h2" className="mb-6">
                  Información Esencial
                </Heading>
                <p className={`mb-6 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Esta información es obligatoria para crear el perfil de tu gimnasio.
                </p>
                <FormStep1 formData={formData} updateField={updateField} />
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Heading variant="h2" className="mb-6">
                  ¡La Información Clave!
                </Heading>
                <p className={`mb-6 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Esta información ayuda a los usuarios a tomar decisiones.
                </p>
                <FormStep2 formData={formData} updateField={updateField} />
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Heading variant="h2" className="mb-6">
                  Los Detalles que Enamoran
                </Heading>
                <p className={`mb-6 ${
                  theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  Información complementaria para destacarte.
                </p>
                <FormStep3 formData={formData} updateField={updateField} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-between">
          <Button
            variant="secondary"
            onClick={handlePrevious}
            disabled={currentStep === 1 || isSubmitting}
          >
            Anterior
          </Button>

          <div className="flex gap-4">
            <Button 
              variant="secondary" 
              onClick={handleFinish}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Finalizar'}
            </Button>

            {currentStep < totalSteps && (
              <Button 
                variant="primary" 
                onClick={handleNext}
                disabled={isSubmitting}
              >
                Siguiente
              </Button>
            )}
          </div>
        </div>

        {submitStatus === 'error' && (
          <div className={`mt-4 p-4 rounded-lg ${
            theme === 'light' 
              ? 'bg-red-50 border border-red-300' 
              : 'bg-red-900/30 border border-red-700'
          }`}>
            <p className={`text-sm ${
              theme === 'light' ? 'text-red-900' : 'text-red-200'
            }`}>
              ❌ {errorMessage}
            </p>
          </div>
        )}

        {showWarningModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div 
              className={`p-6 rounded-lg max-w-md w-full ${
                theme === 'light' ? 'bg-white' : 'bg-gray-800'
              }`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Heading variant="h3" className="mb-4">
                ¡Atención!
              </Heading>
              <p className={`mb-6 ${
                theme === 'light' ? 'text-gray-700' : 'text-gray-300'
              }`}>
                Debes completar toda la información obligatoria del <strong>Paso 1</strong> antes de finalizar:
              </p>
              <ul className={`mb-6 list-disc list-inside space-y-1 ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>
                <li>Nombre del gimnasio</li>
                <li>Ubicación (dirección, ciudad y coordenadas)</li>
                <li>Email de contacto</li>
                <li>Teléfono de contacto</li>
              </ul>
              <Button onClick={() => setShowWarningModal(false)}>
                Entendido
              </Button>
            </motion.div>
          </div>
        )}

        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div 
              className={`p-6 rounded-lg max-w-md w-full ${
                theme === 'light' ? 'bg-white' : 'bg-gray-800'
              }`}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🎉</div>
                <Heading variant="h3" className="mb-4">
                  ¡Registro Exitoso!
                </Heading>
                <p className={`mb-6 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  Hemos recibido la información de <strong>{formData.name}</strong>. 
                  Te contactaremos pronto al email <strong>{formData.contact.email}</strong>.
                </p>
                <Button onClick={handleSuccessModalClose}>
                  Volver al Inicio
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};