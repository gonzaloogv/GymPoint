interface FooterSection {
    title: string;
    links: { name: string; href: string; }[];
}

export const footerSections: FooterSection[] = [
    {
        title: 'Funciones',
        links: [
            { name: 'Búsqueda', href: '#search' },
            { name: 'Gestión de Rutina', href: '#routine' },
            { name: 'Progreso Claro', href: '#progress' },
            { name: 'Rachas y Tokens', href: '#streak' },
        ],
    },
    {
        title: 'Sobre Nosotros',
        links: [
            { name: 'Misión', href: '#mission' },
            { name: 'Nuestro Equipo', href: '#team' },
        ],
    },
    {
        title: 'Redes Sociales',
        links: [
            { name: 'Instagram', href: 'https://instagram.com/gympoint' },
            { name: 'TikTok', href: 'https://tiktok.com/gympoint' },
            { name: 'Youtube', href: 'https://youtube.com/gympoint' },
            { name: 'LinkedIn', href: 'https://linkedin.com/gympoint' },
        ],
    },
];