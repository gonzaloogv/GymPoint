import styled from 'styled-components/native';
import { SegmentedControl } from '@shared/components/ui';

const Container = styled.View`
  padding: ${({ theme }) => theme.spacing(2)}px;
  background-color: ${({ theme }) => theme.colors.card};
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.border};
`;

const Title = styled.Text`
  font-size: ${({ theme }) => theme.typography.small}px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.subtext};
  margin-bottom: ${({ theme }) => theme.spacing(1.5)}px;
`;

const Description = styled.Text`
  font-size: ${({ theme }) => theme.typography.small}px;
  color: ${({ theme }) => theme.colors.subtext};
  margin-bottom: ${({ theme }) => theme.spacing(2)}px;
`;

const TabContainer = styled.View`
  align-items: center;
`;

type Tab = {
  value: string;
  label: string;
};

type Props = {
  title: string;
  description: string;
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tab: string) => void;
};

export function ImportTabHeader({
  title,
  description,
  tabs,
  activeTab,
  onTabChange,
}: Props) {
  return (
    <Container>
      <Title>{title}</Title>
      <Description>{description}</Description>
      <TabContainer>
        <SegmentedControl options={tabs} value={activeTab} onChange={onTabChange} />
      </TabContainer>
    </Container>
  );
}
