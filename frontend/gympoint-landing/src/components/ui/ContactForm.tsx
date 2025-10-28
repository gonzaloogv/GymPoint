import { motion } from 'framer-motion';
import { useContactForm } from '../../hooks';
import { Input, TextArea, Button } from '../ui';
import { fadeInUp, secondaryContainer } from '../../animations/variants';

export const ContactForm: React.FC = () => {
    const {
        result,
        handleSubmit,
        formData,
        handleChange,
        errors
    } = useContactForm();

    return (
        <motion.form 
            onSubmit={handleSubmit} 
            className="max-w-xl mx-auto mt-8 space-y-6"
            initial="hidden"
            animate="visible"
            variants={secondaryContainer}
        >

            <input type="checkbox" name="botcheck" style={{ display: 'none' }} />

            <motion.div variants={fadeInUp}>
                <Input
                    type="email"
                    name="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    className="w-full md:text-lg" 
                    required 
                />
            </motion.div>

            <motion.div variants={fadeInUp}>
                <TextArea
                    name="message"
                    placeholder="Escribe tu mensaje aquí..."
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    className="w-full md:text-lg min-h-[120px] md:min-h-[160px]"
                    required
                    helperText=''
                />
            </motion.div>
            
            <motion.div variants={fadeInUp}>
                <Button 
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={result === 'sending' || !formData.email || !formData.message || !!errors.email}
                    className="w-full"
                >
                    {result === 'sending' ? 'Enviando...' : 'Enviar Mensaje'}
                </Button>
            </motion.div>

            {result && result !== 'sending' && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg text-center font-semibold ${
                        result === 'success' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                    }`}
                >
                    
                    {result === 'success' 
                        ? '¡Mensaje enviado exitosamente!' 
                        : 'Error al enviar. Intenta nuevamente.'
                    }
                </motion.div>
            )}
        </motion.form>
    );
};