import { ResultsInfo as SharedResultsInfo } from '@shared/components/ui';

type Props = { count: number; hasUserLocation: boolean };

export default function ResultsInfo({ count, hasUserLocation }: Props) {
  return (
    <SharedResultsInfo
      count={count}
      hasUserLocation={hasUserLocation}
      itemName="gimnasio"
      itemNamePlural="gimnasios"
    />
  );
}
