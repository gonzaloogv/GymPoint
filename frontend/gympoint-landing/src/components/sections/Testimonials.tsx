import { motion } from 'framer-motion';
import { testimonialsData } from '../../data/testimonialsData';
import { Heading, Card, StarRating, Button, DemoButton } from '../ui';
import { useScrollDirection } from '../../hooks';
import { mainContainer, fadeInUp, secondaryContainer, fadeInLeft } from '../../animations/variants';

export const Testimonials: React.FC = () => {
    const direction = useScrollDirection();

    return (
        <motion.section 
            className="py-20 px-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.1 }}
            variants={mainContainer(direction)}
            id='testimonials'
        >
            <div className="max-w-6xl mx-auto">
                <motion.div variants={fadeInUp}>
                    <Heading variant="h1" align="center" className="mb-16">
                        Opiniones
                    </Heading>
                </motion.div>

                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
                    variants={secondaryContainer}
                >
                    {testimonialsData.map((testimonial) => (
                        <motion.div key={testimonial.id} variants={fadeInLeft}>
                            <Card variant="default" padding="md">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-bold text-lg">{testimonial.name}</h4>
                                        <p className="text-sm text-muted-light">{testimonial.role}</p>
                                    </div>
                                    <p className="text-sm italic">"{testimonial.comment}"</p>
                                    <StarRating rating={testimonial.rating} />
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div 
                    className="flex gap-4 justify-center flex-wrap"
                    variants={fadeInUp}
                >
                    <DemoButton size='lg' className='uppercase'/>
                    <Button variant="secondary" size="lg">
                        <a href="https://www.apple.com/ar/ios/app-store/" target="_blank">
                            DESCARGAR APP
                        </a>
                    </Button>
                </motion.div>
            </div>
        </motion.section>
    );
};