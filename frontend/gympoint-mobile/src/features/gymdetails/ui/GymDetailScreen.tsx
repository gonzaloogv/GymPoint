import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { GymDetailScreenProps } from "../ui/types";

import { 
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

export function GymDetailScreen({ gym, onBack, onCheckIn }: GymDetailScreenProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  useEffect(() => {
    console.log('GymDetailScreen rendered with gym:', gym);
  }, [gym]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const isInRange = gym.distance <= 0.15;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.debugText}>Debug: Gym loaded - {gym.name}</Text>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  debugText: {
    padding: 16,
    fontSize: 16,
    fontWeight: 'bold',
    backgroundColor: '#E3F2FD',
    color: '#1976D2',
  },
});
