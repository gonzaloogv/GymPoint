export const GENDER_OPTIONS = [
  { value: 'male', label: 'Hombre' },
  { value: 'female', label: 'Mujer' },
  { value: 'other', label: 'Otro' },
  { value: 'prefer-not-to-say', label: 'Prefiero no decir' },
] as const;

export type GenderValue = (typeof GENDER_OPTIONS)[number]['value'];
