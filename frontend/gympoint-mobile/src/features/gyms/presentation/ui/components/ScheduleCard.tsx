import React from "react";
import { View, Text } from "react-native";
import { Schedule } from "@features/gyms/domain/entities/Schedule";
import { Card } from "@shared/components/ui";

interface ScheduleCardProps {
  schedules: Schedule[];
  isDark: boolean;
}

const DAY_MAP: Record<string, { name: string; num: number }> = {
  dom: { name: "Domingo", num: 0 },
  lun: { name: "Lunes", num: 1 },
  mar: { name: "Martes", num: 2 },
  mie: { name: "Miércoles", num: 3 },
  mié: { name: "Miércoles", num: 3 },
  jue: { name: "Jueves", num: 4 },
  vie: { name: "Viernes", num: 5 },
  sab: { name: "Sábado", num: 6 },
  sáb: { name: "Sábado", num: 6 },
  sun: { name: "Domingo", num: 0 },
  mon: { name: "Lunes", num: 1 },
  tue: { name: "Martes", num: 2 },
  wed: { name: "Miércoles", num: 3 },
  thu: { name: "Jueves", num: 4 },
  fri: { name: "Viernes", num: 5 },
  sat: { name: "Sábado", num: 6 },
};

const getDayIndex = (day: any): number => {
  if (typeof day === "number") return day;
  const key = (day || "").toString().toLowerCase();
  return DAY_MAP[key]?.num ?? -1;
};

const getDayLabel = (day: any): string => {
  if (typeof day === "number") {
    const labels = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    return labels[day] ?? `Día ${day}`;
  }
  const key = (day || "").toString().toLowerCase();
  return DAY_MAP[key]?.name ?? (typeof day === "string" ? day : "Día");
};

export function ScheduleCard({ schedules, isDark }: ScheduleCardProps) {
  if (!schedules || schedules.length === 0) {
    return null;
  }

  const sortedSchedules = [...schedules].sort((a, b) => {
    const dayA = getDayIndex((a as any).day_of_week);
    const dayB = getDayIndex((b as any).day_of_week);
    return dayA - dayB;
  });

  const today = new Date().getDay();

  return (
    <Card className={isDark ? "bg-surface-dark" : "bg-white"}>
      <View className="flex-row items-center justify-between mb-3">
        <View>
          <Text className={`text-lg font-semibold ${isDark ? "text-text-dark" : "text-text"}`}>
            Horarios de apertura
          </Text>
          <Text className={`text-xs mt-1 ${isDark ? "text-textSecondary-dark" : "text-textSecondary"}`}>
            Revisá los horarios de cada día. Hoy se resalta automáticamente.
          </Text>
        </View>
      </View>

      <View className="gap-2">
        {sortedSchedules.map((schedule, index) => {
          const dayName = getDayLabel((schedule as any).day_of_week);
          const dayNum = getDayIndex((schedule as any).day_of_week);
          const isToday = dayNum === today;

          const openTime =
            (schedule as any).opening_time ||
            (schedule as any).open_time ||
            (schedule as any).opens ||
            "";
          const closeTime =
            (schedule as any).closing_time ||
            (schedule as any).close_time ||
            (schedule as any).closes ||
            "";
          const isClosed = (schedule as any).closed === true || (schedule as any).is_closed === true;
          const hasTimes = Boolean(openTime && closeTime);

          return (
            <View
              key={index}
              className={`flex-row items-center justify-between py-2.5 px-3 rounded-xl border ${
                isToday
                  ? isDark
                    ? "bg-blue-500/15 border-blue-400/30"
                    : "bg-blue-50 border-blue-100"
                  : isDark
                  ? "bg-surfaceVariant-dark border-border-dark"
                  : "bg-surfaceVariant border-border"
              }`}
            >
              <View className="flex-row items-center flex-1">
                {isToday && <View className="w-2 h-2 bg-primary rounded-full mr-2" />}
                <View>
                  <Text
                    className={`text-sm font-semibold ${
                      isToday
                        ? isDark
                          ? "text-blue-300"
                          : "text-primary"
                        : isDark
                        ? "text-text-dark"
                        : "text-text"
                    }`}
                  >
                    {dayName}
                  </Text>
                  {isClosed && (
                    <Text className={`text-xs ${isDark ? "text-textSecondary-dark" : "text-textSecondary"}`}>
                      Cerrado
                    </Text>
                  )}
                </View>
              </View>

              {!isClosed && (
                <View className="items-end">
                  <Text className={`text-sm font-medium ${isDark ? "text-text-dark" : "text-text"}`}>
                    {hasTimes
                      ? `${String(openTime).substring(0, 5)} - ${String(closeTime).substring(0, 5)}`
                      : "No disponible"}
                  </Text>
                  {isToday && (
                    <Text className={`text-xs ${isDark ? "text-blue-200" : "text-blue-600"}`}>
                      Hoy
                    </Text>
                  )}
                </View>
              )}
              {isClosed && (
                <Text className={`text-sm font-medium ${isDark ? "text-textSecondary-dark" : "text-textSecondary"}`}>
                  Cerrado
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </Card>
  );
}
