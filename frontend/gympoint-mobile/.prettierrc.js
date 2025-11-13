module.exports = {
  // Configuración base de Prettier (puedes ajustarla según las preferencias de tu equipo)
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,

  // **Configuración para el plugin de Tailwind CSS**
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindConfig: './tailwind.config.js', // Asegúrate de que esta ruta sea correcta
};