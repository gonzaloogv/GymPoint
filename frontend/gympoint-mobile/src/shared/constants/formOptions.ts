// Valores que coinciden con el backend OpenAPI: M, F, O
export const GENDER_OPTIONS = [
  { value: 'M', label: 'Hombre' },
  { value: 'F', label: 'Mujer' },
  { value: 'O', label: 'Otro' },
] as const;

export type GenderValue = (typeof GENDER_OPTIONS)[number]['value'];
