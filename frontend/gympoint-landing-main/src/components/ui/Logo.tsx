import { NavHashLink } from "react-router-hash-link"
import type { LogoProps} from "../../types";
import { gympointLogo } from "../../assets/imgs";

export const Logo: React.FC<LogoProps> = ({
    size = 'md',
    to = "#home"
}) => {
    const standard = 'h-auto transition-opacity hover:opacity-80';

    const sizeStyle = {
        sm: 'w-24',
        md: 'w-32',
        lg: 'w-40',
    };

    const className = `
        ${standard}
        ${sizeStyle[size]}
    `;

    return (
        <NavHashLink smooth to={to}>
            <img
                src={gympointLogo}
                alt="Logo GymPoint"
                className={className.trim()}
            />
        </NavHashLink>
  );
}