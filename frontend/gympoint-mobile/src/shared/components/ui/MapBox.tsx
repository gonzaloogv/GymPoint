import styled from "styled-components";
import { View } from "react-native";
import { sp, rad } from "@shared/styles/uiTokens";

export const MapBox = styled(View)`
    margin:0 ${({theme})=>sp(theme,2)}px;
    border-radius:${({theme})=>rad(theme,'md',12)}px;
    overflow:hidden;
`;