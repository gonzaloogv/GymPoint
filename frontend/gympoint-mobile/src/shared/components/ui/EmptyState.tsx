import styled from 'styled-components/native';
import { Card } from './Card';
import { Button } from './Button';

const Container = styled.View`
  padding: ${({ theme }) => theme.spacing(2)}px;
`;

const Content = styled.View`
  padding: ${({ theme }) => theme.spacing(3)}px;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)}px;
`;

const Title = styled.Text`
  font-size: ${({ theme }) => theme.typography.h2}px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 700;
  text-align: center;
`;

const Description = styled.Text`
  color: ${({ theme }) => theme.colors.subtext};
  text-align: center;
`;

const ButtonText = styled.Text`
  color: ${({ theme }) => theme.colors.onPrimary};
  text-align: center;
  font-weight: 600;
`;

type Props = {
  title: string;
  description: string;
  buttonText?: string;
  onButtonPress?: () => void;
};

export function EmptyState({ 
  title, 
  description, 
  buttonText, 
  onButtonPress 
}: Props) {
  return (
    <Container>
      <Card>
        <Content>
          <Title>{title}</Title>
          <Description>{description}</Description>
          {buttonText && onButtonPress && (
            <Button 
              variant="primary"
              style={{ 
                minHeight: 44, 
                alignSelf: 'stretch'
              }} 
              onPress={onButtonPress}
            >
              <ButtonText>
                {buttonText}
              </ButtonText>
            </Button>
          )}
        </Content>
      </Card>
    </Container>
  );
}
