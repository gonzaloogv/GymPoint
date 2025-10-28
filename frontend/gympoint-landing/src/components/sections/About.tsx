import { motion } from 'framer-motion';
import { missionImg, teamImg } from "../../assets/imgs";
import { Heading, Paragraph } from "../ui";
import { useScrollDirection } from "../../hooks";
import { mainContainer, fadeInUp, fadeInRight, fadeInLeft } from "../../animations/variants";

export const About: React.FC = () => {
    const direction = useScrollDirection();

    return (
        <motion.section 
            className="py-20 px-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.1 }}
            variants={mainContainer(direction)}
            id='about'
        >
            <div className="max-w-6xl mx-auto">
                <motion.div variants={fadeInUp}>
                    <Heading variant="h1" align="center" className="mb-16">
                        Sobre <span className="text-secondary">Nosotros</span>
                    </Heading>
                </motion.div>

                <div id='mission' className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
                    <motion.div variants={fadeInRight}>
                        <img src={missionImg} alt="Misión" className="rounded-2xl w-full" />
                    </motion.div>
                    <motion.div className="space-y-4" variants={fadeInUp}>
                        <Heading variant="h3">QUIÉNES SOMOS Y NUESTRA MISIÓN</Heading>
                        <Paragraph>
                            En GymPoint queremos hacer del fitness una experiencia simple, motivadora y accesible para todos. Por eso, desarrollamos una plataforma inteligente que te ayuda a encontrar el gimnasio ideal, seguir tu progreso, mantener la constancia con recompensas y conectar con una comunidad que comparte tu objetivo: una vida activa y saludable.
                        </Paragraph>
                    </motion.div>
                </div>

                <div id='team' className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
                    <motion.div className="space-y-4 lg:order-1" variants={fadeInUp}>
                        <Heading variant="h3">NUESTRO EQUIPO: ¿Quienes conforman GymPoint?</Heading>
                        <Paragraph>
                            En GymPoint, contamos con un equipo joven, multidisciplinario y apasionado por la tecnología y el bienestar. Somos estudiantes de sistemas que unimos nuestras habilidades para desarrollar una app que motive, conecte y transforme la forma en que las personas entrenan. Nuestro equipo está conformado por especialistas en desarrollo de Software y expertos en Fitness. Cada integrante aporta su visión para que GymPoint no sea solo una app, sino una experiencia fitness completa y motivadora.
                        </Paragraph>
                    </motion.div>
                    <motion.div className="lg:order-2" variants={fadeInLeft}>
                        <img src={teamImg} alt="Equipo" className="rounded-2xl w-full"/>
                    </motion.div>
                </div>
            </div>
        </motion.section>
    );
};