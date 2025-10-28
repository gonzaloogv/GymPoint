import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading, Button, ContactForm } from '../ui';
import { fadeInUp, mainContainer } from '../../animations/variants';
import { useScrollDirection } from '../../hooks';

export const Contact: React.FC = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const direction = useScrollDirection();

    return (
        <motion.section 
            className="py-20 px-8 bg-blue-950"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.1 }}
            variants={mainContainer(direction)}
            id='contact'
        >
            <div className="max-w-4xl mx-auto text-center">
                <motion.div variants={fadeInUp}>
                    <Heading variant="h1" className="mb-8 text-white">
                        Si te gustó GymPoint y la idea de negocio puedes ponerte en contacto
                    </Heading>
                </motion.div>

                {!isFormOpen && (
                    <motion.div variants={fadeInUp}>
                        <Button 
                            variant="secondary" 
                            size="lg"
                            onClick={() => setIsFormOpen(true)}
                        >
                            CONTACTARSE
                        </Button>
                    </motion.div>
                )}

                <AnimatePresence>
                    {isFormOpen && (
                        <motion.div
                            initial={{ opacity: 0, maxHeight: 0 }}
                            animate={{ opacity: 1, maxHeight: 1000 }}
                            exit={{ opacity: 0, maxHeight: 0 }}
                            transition={{ duration: 0.5 }}
                            style={{ overflow: 'hidden' }}
                        >
                            <ContactForm />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.section>
    );
};