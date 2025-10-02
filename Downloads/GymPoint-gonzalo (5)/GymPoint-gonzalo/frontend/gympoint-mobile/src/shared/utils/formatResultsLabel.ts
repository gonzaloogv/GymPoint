export function formatResultsLabel(
  count: number, 
  hasLocation: boolean,
  itemName: string = "gimnasio",
  itemNamePlural: string = "gimnasios"
) {
  const plural = count !== 1;
  const itemLabel = plural ? itemNamePlural : itemName;
  const foundLabel = plural ? "encontrados" : "encontrado";
  const suffix = hasLocation ? ' • ordenados por distancia' : '';
  
  return `${count} ${itemLabel} ${foundLabel}${suffix}`;
}
