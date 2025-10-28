import { motion } from 'framer-motion';
import { Heading, Paragraph, Button } from '../ui';
import { fadeInLeft, fadeInRight, fadeInUp, mainContainer } from '../../animations/variants';
import { useScrollDirection } from '../../hooks';
import { useNavigate } from 'react-router-dom';

export const GymRegister: React.FC = () => {
    const direction = useScrollDirection();
    const navigate = useNavigate();

    return (
        <motion.section
            className="py-20 px-8 bg-blue-950 mb-0"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.1 }}
            variants={mainContainer(direction)}  
        >
            <div className="max-w-6xl mx-auto text-center">
                <motion.div variants={fadeInUp}>
                    <Heading variant="h1" className="mb-6 text-white">
                    ¿Sos dueño de un gimnasio? Mejora la visibilidad y llega a más clientes
                    </Heading>
                </motion.div>

                <motion.div className="mb-12" variants={fadeInUp}>
                    <Heading variant="h3" className="mb-4 text-white">
                        Con la funcionalidad de búsqueda de Gimnasios de nuestra aplicación buscamos 
                        ayudar no solo a los usuarios finales, sino también a los gimnasios a poder llegar a 
                        más gente y formar una reputación formidable.
                    </Heading>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="text-center">
                        <motion.div variants={fadeInRight} className="text-6xl font-bold text-blue-300 mb-4">90%</motion.div>
                            
                        <motion.div variants={fadeInLeft}>
                            <Paragraph className="text-white/80 text-lg">
                                de los gimnasios que se registran de manera oficial consiguen nuevos clientes
                            </Paragraph>
                        </motion.div>
                    </div>

                    <div className="text-center">
                        <motion.div variants={fadeInRight} className="text-6xl font-bold text-blue-300 mb-4">63%</motion.div>
                        
                        <motion.div variants={fadeInLeft}>
                            <Paragraph className="text-white/80 text-lg">
                                de los gimnasios llega a un público nuevo gracias a GymPoint
                            </Paragraph>
                        </motion.div>
                    </div>

                    <div className="text-center">
                        <motion.div variants={fadeInRight} className="text-6xl font-bold text-blue-300 mb-4">87%</motion.div>
                        
                        <motion.div variants={fadeInLeft}>
                            <Paragraph className="text-white/80 text-lg">
                                de los que probaron GymPoint les pareció fácil, práctico e intuitivo.
                            </Paragraph>
                        </motion.div>
                    </div>
                </div>

                <motion.div variants={fadeInUp}>
                    <Button onClick={() => navigate('/register-gym')} size="lg" className='bg-white font-semibold border-0 text-blue-950 hover:bg-white'>
                            REGISTRAR GIMNASIO
                    </Button>
                </motion.div>
            </div>
        </motion.section>
    );
};