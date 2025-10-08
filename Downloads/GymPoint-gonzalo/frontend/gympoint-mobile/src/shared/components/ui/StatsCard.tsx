import React from 'react';
import styled from 'styled-components/native';

const StatsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin: ${({ theme }) => theme.spacing(-0.5)}px;
`;

const StatBox = styled.View<{ $color: string }>`
  width: 50%;
  padding: ${({ theme }) => theme.spacing(0.5)}px;
`;

const StatCard = styled.View<{ $backgroundColor: string }>`
  background-color: ${({ $backgroundColor }) => $backgroundColor};
  border-radius: ${({ theme }) => theme.radius.md}px;
  padding: ${({ theme }) => theme.spacing(2)}px;
  align-items: center;
  min-height: 80px;
  justify-content: center;
`;

const StatValue = styled.Text<{ $color: string }>`
  font-size: ${({ theme }) => theme.typography.h2}px;
  font-weight: 800;
  color: ${({ $color }) => $color};
  margin-bottom: ${({ theme }) => theme.spacing(0.5)}px;
`;

const StatLabel = styled.Text<{ $color: string }>`
  font-size: ${({ theme }) => theme.typography.small}px;
  color: ${({ $color }) => $color};
  text-align: center;
  font-weight: 600;
`;

const StatText = styled.Text<{ $color: string }>`
  font-size: ${({ theme }) => theme.typography.small}px;
  color: ${({ $color }) => $color};
  text-align: center;
  font-weight: 700;
  margin-bottom: ${({ theme }) => theme.spacing(0.5)}px;
`;

type StatItem = {
  value: number | string;
  label: string;
  backgroundColor: string;
  color: string;
  isText?: boolean;
};

type Props = {
  stats: StatItem[];
};

export function StatsCard({ stats }: Props) {
  return (
    <StatsContainer>
      {stats.map((stat, index) => (
        <StatBox key={index} $color={stat.color}>
          <StatCard $backgroundColor={stat.backgroundColor}>
            {stat.isText ? (
              <StatText $color={stat.color}>{stat.value}</StatText>
            ) : (
              <StatValue $color={stat.color}>{stat.value}</StatValue>
            )}
            <StatLabel $color={stat.color}>{stat.label}</StatLabel>
          </StatCard>
        </StatBox>
      ))}
    </StatsContainer>
  );
}
