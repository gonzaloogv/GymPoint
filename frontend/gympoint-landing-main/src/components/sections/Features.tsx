import { motion } from 'framer-motion';
import { progress, routine, search, streak } from '../../assets/imgs';
import { featuresContent } from '../../data';
import { useTheme, useScrollDirection } from '../../hooks';
import { Heading, Paragraph } from '../ui';
import { FeatureItem } from '../ui/';
import { mainContainer, secondaryContainer, fadeInUp, fadeInLeft } from '../../animations/variants';

export const Features: React.FC = () => {
    const { theme } = useTheme();
    const direction = useScrollDirection();
    const gradient = theme === 'light' ? 'features-gradient-light' : 'features-gradient-dark';

    return (
        <motion.section 
            id='functions'
            className={`py-20 ${gradient}`}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.1 }}
            variants={mainContainer(direction)}
        >
            <div className="max-w-6xl mx-auto px-8">
                <motion.div className="text-center mb-16" variants={fadeInUp}>
                    <Heading variant="h1" align="center">
                        Busca rápidamente y compara<br />
                        los gimnasios de tu zona.
                    </Heading>
                </motion.div>
                
                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16"
                    variants={secondaryContainer}
                >
                    <motion.div className="text-center" variants={fadeInLeft}>
                        <img src={search} className="w-12 h-12 bg-transparent rounded-lg mx-auto mb-4"/>
                        <Paragraph size="lg" align="center">BÚSQUEDA RÁPIDA Y SENCILLA</Paragraph>
                    </motion.div>
                    
                    <motion.div className="text-center" variants={fadeInLeft}>
                        <img src={routine} className="w-12 h-12 bg-transparent rounded-lg mx-auto mb-4"/>
                        <Paragraph size="lg" align="center">GESTIÓN DE RUTINA</Paragraph>
                    </motion.div>
                    
                    <motion.div className="text-center" variants={fadeInLeft}>
                        <img src={progress} className="w-12 h-12 bg-transparent rounded-lg mx-auto mb-4"/>
                        <Paragraph size="lg" align="center">PROGRESO CLARO</Paragraph>
                    </motion.div>
                    
                    <motion.div className="text-center" variants={fadeInLeft}>
                        <img src={streak} className="w-12 h-12 bg-transparent rounded-lg mx-auto mb-4"/>
                        <Paragraph size="lg" align="center">RACHAS Y TOKENS</Paragraph>
                    </motion.div>
                </motion.div>
                
                <div className="space-y-20 mt-16 overflow-hidden">
                    {featuresContent.map((feature, index) => (
                        <FeatureItem 
                            key={feature.id} 
                            feature={feature}
                            reverse={index % 2 !== 0} 
                        />
                    ))}
                </div>
            </div>
        </motion.section>
    );
};