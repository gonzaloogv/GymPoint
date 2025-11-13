import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Heading, Paragraph, Button, DemoButton } from '../ui';
import { mainContainer, fadeInUp, mapVariants } from '../../animations/variants';
import { useMap, useScrollDirection } from '../../hooks';

export const Hero = forwardRef<HTMLElement>((_, ref) => {
    const { isMapOpen } = useMap();
    const direction = useScrollDirection();

    return (
        <motion.section 
            ref={ref} 
            className="pt-12 pb-20 px-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            variants={mainContainer(direction)}
            id='hero'
        >
            <div className="max-w-4xl mx-auto text-center space-y-8">
                <motion.div className="space-y-2" variants={fadeInUp}>
                    <Heading variant="h1" align="center">
                        Entrena <span className="text-secondary">Inteligente.</span>
                    </Heading>
                    <Heading variant="h1" align="center">
                        <span className="text-secondary">Evoluciona</span> Cada Día.
                    </Heading>
                </motion.div>

                <motion.div variants={fadeInUp}>
                    <Paragraph size="lg" color="muted" align="center">
                        Registra, analiza y comparte tu progreso<br />
                        con GymPoint
                    </Paragraph>
                </motion.div>

                <motion.div 
                    className="flex gap-4 justify-center flex-wrap"
                    variants={fadeInUp}
                >
                    <DemoButton size="lg" className="uppercase" />
                        <Button variant="secondary" size="lg">
                            <a href="https://www.apple.com/ar/ios/app-store/" target="_blank">
                                DESCARGAR APP
                            </a>
                        </Button>
                </motion.div>

                <motion.div
                    id='map'
                    initial="hidden"
                    animate={isMapOpen ? "visible" : "hidden"}
                    variants={mapVariants}
                    style={{ overflow: 'hidden' }}
                >
                    <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
                        <Paragraph color="muted" align="center">
                            [Componente de Mapa - Placeholder]
                        </Paragraph>
                    </div>
                </motion.div>
            </div>
        </motion.section>
    );
});

Hero.displayName = 'Hero';