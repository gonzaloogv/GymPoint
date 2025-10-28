import { NavHashLink } from "react-router-hash-link"
import { Button, Logo } from "../ui"
import { ThemeSwitcher } from "../ui"
import { useEffect, useState } from "react";
import { closeMenuIcon, menuIcon } from "../../assets/imgs";
import { useTheme } from "../../hooks";
import { Container } from "./Container";
import { useScrollDirection } from "../../hooks/useScrollDirection";
import { DemoButton } from "../ui/DemoButton";
import { motion, AnimatePresence } from "framer-motion";
import { menuLinkItem, menuLinksContainer, menuOverlayVariants } from "../../animations/variants";


const navLinks = [
    { href: '#functions', label: 'Funciones' },
    { href: '#about', label: 'Sobre Nosotros' },
    { href: '#socialMedia', label: 'Redes Sociales' },
    { href: '#contact', label: 'Contacto' },
];

export const Header = () => {
    const { theme } = useTheme()
    const scrollDirection = useScrollDirection();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAtTop, setIsAtTop] = useState(true);
    const closeMenuDelayed = () => {
        setTimeout(() => {
            closeMenu();
        }, 300);
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsAtTop(window.pageYOffset < 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <header
            className={`
                fixed left-0 right-0 z-50 h-20 flex items-center
                backdrop-blur-sm shadow-md transition-all duration-300
                ${scrollDirection === 'down' && !isAtTop ? '-top-20' : 'top-0'}
                ${theme === 'light'
                    ? 'bg-zinc-300/90 text-gray-800'
                    : 'bg-zinc-900/90 text-gray-100'
                }
            `}
        >
            <Container className="flex items-center w-full gap-8">
                <Logo to="#home"/>

                <nav className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <NavHashLink
                            key={link.href}
                            smooth
                            to={link.href}
                            className={`
                                transition-colors font-display text-xl
                                ${theme === 'light'
                                ? 'text-gray-800 hover:text-secondary'
                                : 'text-gray-100 hover:text-secondary'
                                }
                            `} 
                        >
                            {link.label}
                        </NavHashLink>
                    ))}
                </nav>

                <div className="flex items-center gap-4 ml-auto">
                    <ThemeSwitcher />
                    <div className="hidden sm:flex gap-2">
                        <Button variant="secondary" size="sm">
                            <a href="https://www.apple.com/ar/ios/app-store/" target="_blank">
                                Descargar App
                            </a>
                        </Button>
                        <DemoButton size="sm" />
                    </div>

                    <button
                        className="md:hidden z-50 text-gray-800 dark:text-gray-200"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
                        aria-expanded={isMenuOpen}
                    >
                        <img 
                            src={isMenuOpen ? closeMenuIcon : menuIcon}
                            className="w-12"
                            alt={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
                        />
                    </button>
                </div>

                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.nav 
                            className={`absolute top-0 left-0 w-full h-screen md:hidden flex flex-col items-center justify-center gap-8 text-2xl
                            ${theme === 'light'
                            ? 'bg-primary-light'
                            : 'bg-primary-dark'
                            }`}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={menuOverlayVariants}
                        >
                            <motion.div
                                className="flex flex-col items-center gap-8"
                                variants={menuLinksContainer}
                                initial="hidden"
                                animate="visible"
                            >
                                {navLinks.map((link) => (
                                    <motion.div key={link.href} variants={menuLinkItem}>
                                        <NavHashLink 
                                            smooth 
                                            to={link.href} 
                                            onClick={closeMenu}
                                            className="text-2xl"
                                        >
                                            {link.label}
                                        </NavHashLink>
                                    </motion.div>
                                ))}
                            </motion.div>

                            <motion.div 
                                className="flex gap-4 mt-8"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, duration: 0.3 }}
                            >
                                <DemoButton 
                                    size="sm" 
                                    onAdditionalClick={closeMenuDelayed}
                                />
                                <Button variant="primary">
                                    <a href="https://www.apple.com/ar/ios/app-store/" target="_blank">
                                        Descargar App
                                    </a>
                                </Button>
                            </motion.div>
                        </motion.nav>
                    )}
                </AnimatePresence>
            </Container>
        </header>

    )
}