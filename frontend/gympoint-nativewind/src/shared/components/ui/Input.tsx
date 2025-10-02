import { TextInput, TextInputProps, View } from 'react-native';
import { cn } from '../utils/cn';

export default function Input(props: TextInputProps & { left?: React.ReactNode; right?: React.ReactNode; className?: string }) {
  const { left, right, className, ...rest } = props;
  return (
    <View className={cn('flex-row items-center bg-white rounded-2xl border border-gray-200 px-4', className)}>
      {left}
      <TextInput className="flex-1 py-3 text-base" placeholderTextColor="#8A8FA0" {...rest} />
      {right}
    </View>
  );
}
