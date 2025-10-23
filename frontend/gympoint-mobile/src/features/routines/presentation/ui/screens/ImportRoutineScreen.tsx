import { useState } from 'react';
import { Alert, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@shared/hooks';

import { Screen } from '@shared/components/ui';
import { ScreenHeader } from '../components/ScreenHeader';
import { ImportTabHeader } from '../components/ImportTabHeader';
import { ImportRoutineList } from '../components/ImportRoutineList';
import { PredesignedRoutine } from '@features/routines/domain/entities/PredesignedRoutine';
import { TEMPLATE_ROUTINES, GYM_ROUTINES } from '@features/routines/data/predesignedRoutines.mock';
import { RoutinesStackParamList } from '@presentation/navigation/types';

type NavigationProp = NativeStackNavigationProp<RoutinesStackParamList, 'ImportRoutine'>;

const TABS = [
  { value: 'templates', label: 'Plantillas' },
  { value: 'gyms', label: 'Desde gimnasio' },
];

const TAB_CONTENT = {
  templates: {
    title: 'Plantillas disponibles',
    description: 'Rutinas pre-diseñadas por entrenadores profesionales',
    emptyTitle: 'No hay plantillas disponibles',
    emptyDescription: 'Vuelve más tarde para ver nuevas plantillas',
  },
  gyms: {
    title: 'Rutinas de gimnasios',
    description: 'Rutinas compartidas por gimnasios asociados',
    emptyTitle: 'No hay rutinas de gimnasios',
    emptyDescription: 'No hay gimnasios compartiendo rutinas en este momento',
  },
};

export default function ImportRoutineScreen() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#111827' : '#f9fafb';

  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<'templates' | 'gyms'>('templates');

  const routines = activeTab === 'templates' ? TEMPLATE_ROUTINES : GYM_ROUTINES;
  const content = TAB_CONTENT[activeTab];

  const handleImport = (routine: PredesignedRoutine) => {
    Alert.alert(
      'Importar rutina',
      `¿Deseas importar la rutina "${routine.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Importar',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <ScreenHeader title="Importar rutina" onBack={() => navigation.goBack()} />
      <ImportTabHeader
        title={content.title}
        description={content.description}
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as 'templates' | 'gyms')}
      />
      <View className="flex-1" style={{ backgroundColor: bgColor }}>
        <ImportRoutineList
          routines={routines}
          onImport={handleImport}
          emptyTitle={content.emptyTitle}
          emptyDescription={content.emptyDescription}
        />
      </View>
    </Screen>
  );
}
