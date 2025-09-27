// helpers de spacing/radius/typography centralizados
export const sp = (theme: any, n: number) =>
    typeof theme?.spacing === 'function'
      ? theme.spacing(n)
      : typeof theme?.spacing === 'number'
      ? theme.spacing * n
      : theme?.spacing?.[n] ?? n * 8;
  
  export const rad = (theme: any, key: string, fallback = 12) =>
    typeof theme?.radius === 'number' ? theme.radius : theme?.radius?.[key] ?? fallback;
  
  export const font = (theme: any, key: string, fallback = 14) =>
    typeof theme?.typography?.[key] === 'number' ? theme.typography[key] : fallback;
  