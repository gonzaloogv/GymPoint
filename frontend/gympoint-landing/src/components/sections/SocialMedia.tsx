import { Heading } from '../ui';
import type { SocialLink } from '../../types';
import { instagramIcon, tiktokIcon, youtubeIcon, linkedinIcon, socialMediaImg } from '../../assets/imgs'
import { useScrollDirection, useTheme } from '../../hooks';
import { motion } from 'framer-motion';
import { fadeInLeft, fadeInRight, fadeInUp, mainContainer } from '../../animations/variants';

const socialLinks: SocialLink[] = [
    { name: 'Instagram', url: 'https://instagram.com/gympoint', icon: instagramIcon },
    { name: 'TikTok', url: 'https://tiktok.com/@gympoint', icon: tiktokIcon },
    { name: 'Youtube', url: 'https://youtube.com/@gympoint', icon: youtubeIcon },
    { name: 'LinkedIn', url: 'https://linkedin.com/company/gympoint', icon: linkedinIcon },
];

export const SocialMedia: React.FC = () => {
    const { theme } = useTheme();
    const gradient = theme === 'light' ? 'features-gradient-light' : 'features-gradient-dark';
    const direction = useScrollDirection();

    return (
        <motion.section 
            className={`py-20 px-8 mb-0 ${gradient}`}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.1 }}
            variants={mainContainer(direction)}  
            id='socialMedia'
        >
            <div className="max-w-6xl mx-auto">
                <motion.div variants={fadeInUp}>
                    <Heading variant="h1" align="center" className="mb-16">
                        Nuestras Redes Sociales
                    </Heading>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
                    <div className="space-y-8">
                        {socialLinks.map((social) => (
                            <motion.a
                                variants={fadeInLeft}
                                key={social.name}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-6 hover:opacity-80 transition-opacity"
                            >
                                <img 
                                    src={social.icon} 
                                    alt={social.name} 
                                    className="w-16 h-16"
                                />
                                <Heading variant="h2">{social.name}</Heading>
                            </motion.a>  
                        ))}
                    </div>

                    <motion.div variants={fadeInRight} className="flex justify-center">
                        <img 
                            src={socialMediaImg} 
                            alt="Redes Sociales" 
                            className="max-w-md w-full scale-x-[-1]"
                        />
                    </motion.div>
                </div>

                <motion.div variants={fadeInUp} className="text-center">
                    <Heading variant="h2">
                        <span className="text-secondary">Síguenos</span> para mantenerte al{' '}
                        <span className="text-secondary">día</span> sobre futuras{' '}
                        <span className="text-secondary">actualizaciones!</span>
                    </Heading>
                </motion.div>
            </div>
        </motion.section>
    );
};