import styled, { css } from 'styled-components/native';

type CircleProps = {
  $size?: number;
  $background?: string;
  $borderColor?: string;
};

export const Circle = styled.View<CircleProps>`
  width: ${({ $size = 40 }) => $size}px;
  height: ${({ $size = 40 }) => $size}px;
  border-radius: ${({ $size = 40 }) => $size / 2}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $background, theme }) =>
    $background ?? theme?.colors?.card ?? '#fff'};
  ${({ $borderColor }) =>
    $borderColor
      ? css`
          border-width: 1px;
          border-color: ${$borderColor};
        `
      : ''};
`;
