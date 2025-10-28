import { motion } from 'framer-motion';
import { Heading, Paragraph } from '../ui';
import type { FeatureItemProps } from '../../types';
import { fadeInLeft, fadeInRight } from '../../animations/variants';

export const FeatureItem: React.FC<FeatureItemProps> = ({ feature, reverse }) => {

    return (
        <motion.div 
            id={feature.id}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 overflow-hidden items-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
        >
          <motion.div className={`space-y-6 ${reverse ? 'lg:order-2' : 'lg:order-1'}`} variants={fadeInLeft}>
            <Heading variant="h2" align="left">{feature.title}</Heading>
            <Paragraph>{feature.description}</Paragraph>
            
            <div className="flex items-start gap-4">
              <div className="text-4xl font-bold text-secondary leading-none">
                  {feature.stat.number}
              </div>
              <Paragraph>{feature.stat.description}</Paragraph>
            </div>
          </motion.div>
          
          <motion.div 
            className={`bg-white rounded-2xl shadow-lg p-8 h-80 flex items-center justify-center ${reverse ? 'lg:order-1' : 'lg:order-2'}`}
            variants={fadeInRight}
          >
            <Paragraph align="center" color="muted">
                {feature.mediaType === 'video' ? 'Video Ilustrativo' : 'Imagen'}
            </Paragraph>
          </motion.div>
        </motion.div>
    );
};