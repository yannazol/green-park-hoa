import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/hooks/use-app-theme';
import getCardStyles from '@/styles/card-styles';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function Card({ children, style }: Props) {
  const c = useAppTheme();
  const s = getCardStyles(c);

  return <View style={[s.card, style]}>{children}</View>;
}
