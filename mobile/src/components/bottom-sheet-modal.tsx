import type { ReactNode } from 'react';
import { Modal, useWindowDimensions, View, type DimensionValue, type ModalProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/use-app-theme';
import getBottomSheetModalStyles from '@/styles/bottom-sheet-modal-styles';

type Props = Pick<ModalProps, 'visible' | 'onRequestClose'> & {
  children: ReactNode;
  sheetHeight?: DimensionValue;
  fitContent?: boolean;
  contentHeight?: number;
};

export default function BottomSheetModal({
  visible,
  onRequestClose,
  children,
  sheetHeight,
  fitContent = false,
  contentHeight = 0,
}: Props) {
  const c = useAppTheme();
  const s = getBottomSheetModalStyles(c);
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const maxSheetHeight = Math.min(height * 0.92, height - 24);
  const measuredHeight = contentHeight
    ? Math.min(contentHeight + insets.top + insets.bottom + 8, maxSheetHeight)
    : 360;
  const heightStyle = fitContent
    ? { height: measuredHeight }
    : sheetHeight
      ? { height: sheetHeight }
      : null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={onRequestClose}>
      <View style={s.backdrop}>
        <View style={[s.sheet, heightStyle, { maxHeight: maxSheetHeight }]}>{children}</View>
      </View>
    </Modal>
  );
}
