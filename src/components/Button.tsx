import React from 'react';
import {
  TouchableOpacity,
  Text,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
  StyleProp,
} from 'react-native';
import { COLORS } from '../config/color';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'other';

interface ButtonProps {
  variant?: ButtonVariant;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  rounded?: boolean; // New prop to choose rounded or not
}

const VARIANT_STYLES: Record<
  ButtonVariant,
  { button: ViewStyle; text: TextStyle }
> = {
  primary: {
    button: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    text: { color: COLORS.black },
  },
  secondary: {
    button: {
      backgroundColor: COLORS.secondary,
      borderColor: COLORS.secondary,
    },
    text: { color: COLORS.black },
  },
  info: {
    button: {
      backgroundColor: COLORS.info,
      borderColor: COLORS.info,
    },
    text: { color: COLORS.black },
  },
  success: {
    button: {
      backgroundColor: COLORS.success,
      borderColor: COLORS.success,
    },
    text: { color: COLORS.black },
  },
  warning: {
    button: {
      backgroundColor: COLORS.warning,
      borderColor: COLORS.warning,
    },
    text: { color: COLORS.black },
  },
  danger: {
    button: {
      backgroundColor: COLORS.danger,
      borderColor: COLORS.danger,
    },
    text: { color: COLORS.white },
  },
  other: {
    button: {
      backgroundColor: COLORS.veryDarkGray,
      borderColor: COLORS.veryDarkGray,
    },
    text: { color: COLORS.white },
  },
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  style,
  textStyle,
  onPress,
  disabled,
  accessibilityLabel,
  rounded = false, // default: not rounded
}) => {
  const baseButtonStyle: ViewStyle = {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: rounded ? 50 : 10, // Chooses rounded or not
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: disabled ? 0.5 : 1,
    ...VARIANT_STYLES[variant].button,
  };

  const baseTextStyle: TextStyle = {
    fontWeight: '600',
    fontSize: 16,
    ...VARIANT_STYLES[variant].text,
  };

  return (
    <TouchableOpacity
      style={[baseButtonStyle, style]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      activeOpacity={0.8}
    >
      {typeof children === 'string' ? (
        <Text style={[baseTextStyle, textStyle]}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};
