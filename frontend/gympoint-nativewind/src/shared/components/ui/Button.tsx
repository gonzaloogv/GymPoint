import { Pressable, Text, PressableProps } from 'react-native';
import { cn } from '../utils/cn';

type Props = PressableProps & { title: string; variant?: 'primary'|'outline'|'ghost'; className?: string };
export default function Button({ title, variant='primary', className, ...rest }: Props) {
  const base = 'px-5 py-3 rounded-2xl items-center';
  const variants = { primary: 'bg-gp-primary', outline: 'border border-gp-primary', ghost: '' } as const;
  const text = variant === 'outline' ? 'text-gp-primary' : 'text-white';
  return (
    <Pressable className={cn(base, variants[variant], className)} {...rest}>
      <Text className={cn('font-semibold', text)}>{title}</Text>
    </Pressable>
  );
}
