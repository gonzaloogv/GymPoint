import React, { useState } from "react";
import styled from "styled-components/native";
import { GymDetailScreenProps } from "../ui/types";

import { 
    Header,
    HeroImage, 
    BasicInfo, 
    Services, 
    PriceCard,
    EquipmentList, 
    ContactInfo,
    Rules, 
    CheckInSection, 
    RecentActivity, 
} from './components';

 
const Container = styled.ScrollView`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export function GymDetailScreen({ gym, onBack, onCheckIn }: GymDetailScreenProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const isInRange = gym.distance <= 0.15;

  return (
    <Container>
      <Header name={gym.name} onBack={onBack} />
      <HeroImage />
      <BasicInfo gym={gym} />
      <Services services={gym.services} />
      <PriceCard price={gym.price ?? 30000} />
      <EquipmentList
        equipment={gym.equipment}
        expandedCategories={expandedCategories}
        toggleCategory={toggleCategory}
      />
      <ContactInfo />
      <Rules />
      <CheckInSection gym={gym} isInRange={isInRange} onCheckIn={onCheckIn} />
      <RecentActivity />
    </Container>
  );
}
