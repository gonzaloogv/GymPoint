import { NavHashLink } from "react-router-hash-link";
import { ThemeSwitcher } from "../../UI";


export const Header = () => {

    return (
        <header className="header-container">
            <NavHashLink smooth to="#home">
                <img src={gympointLogo} className="logo"></img>
            </NavHashLink>

            <nav className="header-nav">
                <NavHashLink smooth to="#about" className="nav-link">
                    Funciones
                </NavHashLink>

                <NavHashLink smooth to="#portfolio" className="nav-link">
                    Sobre Nosotros
                </NavHashLink>

                <NavHashLink smooth to="#contact" className="nav-link">
                    Opiniones
                </NavHashLink>

                <NavHashLink smooth to="#contact" className="nav-link">
                    Redes Sociales
                </NavHashLink>

                <ThemeSwitcher />

                <NavHashLink smooth to="#contact" className="nav-link">
                    Contacto
                </NavHashLink>

                <Button> Descargar App </Button>
        
                <Button> Probar </Button>

            </nav>
        </header>
    );
};