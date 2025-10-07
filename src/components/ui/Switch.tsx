import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '../../lib/theme';

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export const Switch: React.FC<SwitchProps> = ({
  value,
  onValueChange,
  label,
  disabled = false,
  size = 'md',
  style,
  labelStyle,
}) => {
  const animatedValue = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: value ? 1 : 0,
      useNativeDriver: false,
      tension: 150,
      friction: 8,
    }).start();
  }, [value]);

  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onValueChange(!value);
    }
  };

  const sizes = {
    sm: { width: 40, height: 20, thumbSize: 16 },
    md: { width: 50, height: 24, thumbSize: 20 },
    lg: { width: 60, height: 28, thumbSize: 24 },
  };

  const { width, height, thumbSize } = sizes[size];

  const trackStyle = {
    backgroundColor: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [theme.colors.border.secondary, theme.colors.neon.green],
    }),
    width,
    height,
    borderRadius: height / 2,
    justifyContent: 'center' as const,
    padding: 2,
    opacity: disabled ? 0.5 : 1,
  };

  const thumbStyle = {
    transform: [
      {
        translateX: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, width - thumbSize - 4],
        }),
      },
    ],
    width: thumbSize,
    height: thumbSize,
    borderRadius: thumbSize / 2,
    backgroundColor: theme.colors.text.primary,
    shadowColor: value ? theme.colors.neon.green : theme.colors.text.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: value ? 0.5 : 0.2,
    shadowRadius: value ? 6 : 2,
    elevation: value ? 8 : 4,
  };

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    ...style,
  };

  const textStyle: TextStyle = {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
    marginLeft: theme.spacing[3],
    ...labelStyle,
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      style={containerStyle}
      activeOpacity={0.8}
    >
      <Animated.View style={trackStyle}>
        <Animated.View style={thumbStyle} />
      </Animated.View>
      {label && <Text style={textStyle}>{label}</Text>}
    </TouchableOpacity>
  );
};