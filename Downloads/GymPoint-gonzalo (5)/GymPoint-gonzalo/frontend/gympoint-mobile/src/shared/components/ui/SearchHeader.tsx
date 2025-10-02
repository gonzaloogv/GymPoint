import { memo } from 'react';
import styled from 'styled-components/native';
import { Input } from './Input';
import { Row } from './Row';
import { font, sp } from '@shared/styles';

const Container = styled.View`
  padding: ${({ theme }) => sp(theme, 2)}px ${({ theme }) => sp(theme, 2)}px 0;
`;

const TitleRow = styled(Row)`
  margin-bottom: ${({ theme }) => sp(theme, 1.5)}px;
`;

const Title = styled.Text`
  color: ${({ theme }) => theme?.colors?.text ?? '#111'};
  font-size: ${({ theme }) => font(theme, 'h4', 18)}px;
  font-weight: 700;
`;

const SearchBarContainer = styled.View`
  width: 100%;
`;

type Props = {
  title: string;
  searchText: string;
  onChangeSearch: (value: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
};

export function SearchHeader({
  title,
  searchText,
  onChangeSearch,
  searchPlaceholder = "Buscar...",
  children,
}: Props) {
  return (
    <Container>
      <TitleRow $justify="space-between">
        <Title>{title}</Title>
        {children}
      </TitleRow>

      <SearchBarContainer>
        <Input
          placeholder={searchPlaceholder}
          value={searchText}
          onChangeText={onChangeSearch}
        />
      </SearchBarContainer>
    </Container>
  );
}
