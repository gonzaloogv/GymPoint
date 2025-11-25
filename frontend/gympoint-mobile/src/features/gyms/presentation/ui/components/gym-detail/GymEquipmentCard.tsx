import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { InfoCard } from "@shared/components/ui";
import { useTheme } from "@shared/hooks";

interface EquipmentCategory {
  category: string;
  icon: string;
  items: { name: string; quantity: number }[];
}

interface GymEquipmentCardProps {
  equipment: EquipmentCategory[];
}

export function GymEquipmentCard({ equipment }: GymEquipmentCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  if (!equipment || equipment.length === 0) {
    return null;
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  };

  const getTotalQuantity = (items: { name: string; quantity: number }[]) =>
    items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <InfoCard variant="default" className="mx-4 mt-4">
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <View
          className="w-14 h-14 rounded-[20px] border items-center justify-center mr-[14px]"
          style={{
            backgroundColor: isDark ? "rgba(251, 146, 60, 0.2)" : "rgba(251, 146, 60, 0.14)",
            borderColor: isDark ? "rgba(251, 146, 60, 0.38)" : "rgba(251, 146, 60, 0.24)",
          }}
        >
          <Feather name="activity" size={20} color={isDark ? "#FDBA74" : "#EA580C"} />
        </View>
        <Text
          className="text-lg font-bold"
          style={{ color: isDark ? "#F9FAFB" : "#111827", letterSpacing: -0.2 }}
        >
          Equipamiento disponible
        </Text>
      </View>

      {/* Category List */}
      <View className="gap-3">
        {equipment.map(({ category, icon, items }) => {
          const expanded = expandedCategories.includes(category);
          const totalItems = getTotalQuantity(items);

          return (
            <View key={category} className="gap-2.5">
              <TouchableOpacity
                className="flex-row items-center justify-between border rounded-2xl px-4 py-[14px]"
                style={{
                  backgroundColor: isDark ? "rgba(17, 24, 39, 0.6)" : "#F9FAFB",
                  borderColor: isDark ? "rgba(55, 65, 81, 0.8)" : "#E5E7EB",
                }}
                onPress={() => toggleCategory(category)}
                activeOpacity={0.75}
              >
                {/* Left Side */}
                <View className="flex-row items-center flex-1 gap-2.5">
                  <Text className="text-[22px]">{icon}</Text>
                  <Text
                    className="text-[15px] font-semibold"
                    style={{ color: isDark ? "#F9FAFB" : "#111827" }}
                  >
                    {category}
                  </Text>
                </View>

                {/* Right Side */}
                <View className="flex-row items-center gap-2.5">
                  <View
                    className="rounded-full px-2.5 py-1"
                    style={{
                      backgroundColor: isDark ? "rgba(99, 102, 241, 0.25)" : "rgba(79, 70, 229, 0.12)",
                    }}
                  >
                    <Text
                      className="text-xs font-bold uppercase"
                      style={{
                        color: isDark ? "#C7D2FE" : "#4338CA",
                        letterSpacing: 0.4,
                      }}
                    >
                      {totalItems}
                    </Text>
                  </View>
                  <Feather
                    name={expanded ? "chevron-up" : "chevron-down"}
                    size={18}
                    color={isDark ? "#9CA3AF" : "#6B7280"}
                  />
                </View>
              </TouchableOpacity>

              {/* Expanded Items */}
              {expanded && (
                <View
                  className="border-l-2 ml-4 pl-4 gap-2.5"
                  style={{
                    borderLeftColor: isDark ? "rgba(55, 65, 81, 0.8)" : "#E5E7EB",
                  }}
                >
                  {items.map((item) => (
                    <View key={`${category}-${item.name}`} className="flex-row items-center justify-between">
                      <Text
                        className="flex-1 text-sm"
                        style={{ color: isDark ? "#9CA3AF" : "#6B7280" }}
                      >
                        {item.name}
                      </Text>
                      <Text
                        className="text-sm font-bold"
                        style={{ color: isDark ? "#F9FAFB" : "#111827" }}
                      >
                        x{item.quantity}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </View>
    </InfoCard>
  );
}
