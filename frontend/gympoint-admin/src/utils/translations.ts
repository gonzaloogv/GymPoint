/**
 * Funciones de traducción para mostrar valores en español
 */

/**
 * Traduce el difficulty de inglés a español en mayúsculas
 */
export function translateDifficulty(difficulty: string | null | undefined): string {
  if (!difficulty) return 'N/A';

  const translations: Record<string, string> = {
    'beginner': 'PRINCIPIANTE',
    'intermediate': 'INTERMEDIO',
    'advanced': 'AVANZADO',
    'BEGINNER': 'PRINCIPIANTE',
    'INTERMEDIATE': 'INTERMEDIO',
    'ADVANCED': 'AVANZADO',
  };

  return translations[difficulty] || difficulty.toUpperCase();
}

/**
 * Traduce el reward type a español en mayúsculas
 */
export function translateRewardType(type: string | null | undefined): string {
  if (!type) return 'SIN TIPO';

  const translations: Record<string, string> = {
    'descuento': 'DESCUENTO',
    'pase_gratis': 'PASE GRATIS',
    'producto': 'PRODUCTO',
    'servicio': 'SERVICIO',
    'merchandising': 'MERCHANDISING',
    'otro': 'OTRO',
  };

  return translations[type] || type.toUpperCase().replace(/_/g, ' ');
}
