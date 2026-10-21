import { StyleSheet } from 'react-native';

import { radius, type AppColors } from '@/constants/theme';

export default function getBadgeStyles(c: AppColors) {
  return StyleSheet.create({
    base: {
      alignSelf: 'flex-start',
      paddingVertical: 3,
      paddingHorizontal: 10,
      borderRadius: radius.lg,
      borderWidth: 1,
    },
    text: { 
      fontSize: 12, 
      fontWeight: '600' 
    },

    success: { 
      backgroundColor: c.successBg, 
      borderColor: c.successBorder 
    },
    successText: { 
      color: c.successText 
    },
    warning: { 
      backgroundColor: c.warningBg, 
      borderColor: c.warningBorder 
    },
    warningText: { 
      color: c.warningText 
    },
    danger: { 
      backgroundColor: c.dangerBg, 
      borderColor: c.dangerBorder 
    },
    dangerText: { 
      color: c.dangerText 
    },
    info: { 
      backgroundColor: c.infoBg, 
      borderColor: c.infoBorder 
    },
    infoText: { 
      color: c.infoText 
    },
    neutral: { backgroundColor: c.bgMuted, borderColor: c.border },
    neutralText: { color: c.textSecondary },
  });
}