import styled from 'styled-components/native';
import { sp } from '@shared/styles';

const InfoText = styled.Text`
  color: ${({ theme }) => theme?.colors?.subtext ?? '#6b7280'};
  padding: 0 ${({ theme }) => sp(theme, 2)}px;
  margin-top: 6px;
`;

type Props = { 
  count: number; 
  hasUserLocation: boolean;
  itemName?: string;
  itemNamePlural?: string;
};

export function ResultsInfo({ 
  count, 
  hasUserLocation, 
  itemName = "gimnasio",
  itemNamePlural = "gimnasios"
}: Props) {
  const plural = count !== 1;
  const itemLabel = plural ? itemNamePlural : itemName;
  const foundLabel = plural ? "encontrados" : "encontrado";
  const locationSuffix = hasUserLocation ? ' ordenados por distancia' : '';

  return (
    <InfoText>
      {count} {itemLabel} {foundLabel}{locationSuffix}
    </InfoText>
  );
}
