import { FloatingActionBar } from '@shared/components/ui';

type Props = {
  onCreate: () => void;
  onImport: () => void;
};

export default function FloatingActions({ onCreate, onImport }: Props) {
  const actions = [
    { label: 'Nueva rutina', onPress: onCreate },
    { label: 'Importar', onPress: onImport },
  ];

  return <FloatingActionBar actions={actions} />;
}
