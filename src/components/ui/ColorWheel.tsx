import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Defs, RadialGradient, Stop, Circle, Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { theme } from '../../lib/theme';

interface ColorWheelProps {
  size?: number;
  onColorChange?: (color: string) => void;
  initialColor?: string;
  disabled?: boolean;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
}

export const ColorWheel: React.FC<ColorWheelProps> = ({
  size = 200,
  onColorChange,
  initialColor = '#ff0000',
  disabled = false,
  onInteractionStart,
  onInteractionEnd,
}) => {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 20;
  
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const colorOpacity = useSharedValue(1);
  const [currentColor, setCurrentColor] = useState(initialColor);
  
  // Debounced color change callback
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastColorRef = useRef<string>(initialColor);
  
  // Platform-specific configurations
  const isIOS = Platform.OS === 'ios';
  const isAndroid = Platform.OS === 'android';
  
  // Platform-specific animation configs
  const springConfig = {
    damping: isIOS ? 15 : 12, // iOS handles higher damping better
    stiffness: isIOS ? 150 : 120, // Android prefers lower stiffness
    mass: isIOS ? 1 : 0.8,
  };
  
  // Platform-specific debounce timing
  const debounceDelay = isAndroid ? 20 : 16; // Android needs slightly more time

  // Convert hex color to position on wheel
  const getPositionFromColor = (hexColor: string): { x: number; y: number } => {
    try {
      // Validate input
      if (typeof hexColor !== 'string' || !hexColor) {
        console.warn('ColorWheel: Invalid hex color input', { hexColor });
        return { x: 0, y: 0 };
      }
      
      // Validate hex format
      const cleanHex = hexColor.replace('#', '');
      if (!/^[0-9a-f]{6}$/i.test(cleanHex)) {
        console.warn('ColorWheel: Invalid hex color format', { hexColor });
        return { x: 0, y: 0 };
      }
      
      // Convert hex to RGB
      const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
      const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
      const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
      
      // Validate RGB values
      if (isNaN(r) || isNaN(g) || isNaN(b) || 
          !isFinite(r) || !isFinite(g) || !isFinite(b)) {
        console.warn('ColorWheel: Invalid RGB conversion', { r, g, b });
        return { x: 0, y: 0 };
      }
      
      // Convert RGB to HSV
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const diff = max - min;
      
      let hue = 0;
      if (diff !== 0) {
        if (max === r) {
          hue = ((g - b) / diff) % 6;
        } else if (max === g) {
          hue = (b - r) / diff + 2;
        } else {
          hue = (r - g) / diff + 4;
        }
      }
      hue = (hue * 60 + 360) % 360;
      
      // Validate hue calculation
      if (isNaN(hue) || !isFinite(hue)) {
        console.warn('ColorWheel: Invalid hue calculation', { hue });
        return { x: 0, y: 0 };
      }
      
      const saturation = max === 0 ? 0 : diff / max;
      
      // Validate saturation
      if (isNaN(saturation) || !isFinite(saturation)) {
        console.warn('ColorWheel: Invalid saturation calculation', { saturation });
        return { x: 0, y: 0 };
      }
      
      // Convert to position with corrected angle calculation
      // Reverse the hue adjustment to match getColorFromPosition
      const adjustedHue = (360 - hue) % 360;
      const angle = (adjustedHue * Math.PI) / 180;
      const distance = saturation * radius;
      
      // Validate final calculations
      if (isNaN(angle) || isNaN(distance) || !isFinite(angle) || !isFinite(distance)) {
        console.warn('ColorWheel: Invalid position calculation', { angle, distance });
        return { x: 0, y: 0 };
      }
      
      const x = Math.cos(angle) * distance;
      const y = -Math.sin(angle) * distance; // Negative for correct orientation
      
      // Validate final position
      if (isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) {
        console.warn('ColorWheel: Invalid final position', { x, y });
        return { x: 0, y: 0 };
      }
      
      return { x, y };
    } catch (error) {
      console.error('ColorWheel: Error in getPositionFromColor', error);
      return { x: 0, y: 0 };
    }
  };

  // Initialize selector position based on initial color
  useEffect(() => {
    const position = getPositionFromColor(initialColor);
    translateX.value = withSpring(position.x, springConfig);
    translateY.value = withSpring(position.y, springConfig);
    setCurrentColor(initialColor);
    lastColorRef.current = initialColor;
  }, [initialColor, springConfig]);

  // Convert HSV to RGB
  const hsvToRgb = (h: number, s: number, v: number): string => {
    try {
      // Validate input parameters
      if (typeof h !== 'number' || typeof s !== 'number' || typeof v !== 'number' ||
          isNaN(h) || isNaN(s) || isNaN(v) ||
          !isFinite(h) || !isFinite(s) || !isFinite(v)) {
        console.warn('ColorWheel: Invalid HSV values', { h, s, v });
        return 'rgb(255, 0, 0)'; // Default to red
      }
      
      // Clamp values to valid ranges
      h = Math.max(0, Math.min(360, h));
      s = Math.max(0, Math.min(1, s));
      v = Math.max(0, Math.min(1, v));
      
      const c = v * s;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = v - c;
      
      let r = 0, g = 0, b = 0;
      
      if (0 <= h && h < 60) {
        r = c; g = x; b = 0;
      } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0;
      } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x;
      } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c;
      } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c;
      } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x;
      }
      
      r = Math.round(Math.max(0, Math.min(255, (r + m) * 255)));
      g = Math.round(Math.max(0, Math.min(255, (g + m) * 255)));
      b = Math.round(Math.max(0, Math.min(255, (b + m) * 255)));
      
      return `rgb(${r}, ${g}, ${b})`;
    } catch (error) {
      console.error('ColorWheel: Error in hsvToRgb', error);
      return 'rgb(255, 0, 0)'; // Default to red
    }
  };

  // Convert RGB to Hex
  const rgbToHex = (rgb: string): string => {
    try {
      // Validate input
      if (typeof rgb !== 'string' || !rgb) {
        console.warn('ColorWheel: Invalid RGB string', { rgb });
        return '#000000';
      }
      
      const match = rgb.match(/rgb\((\d+), (\d+), (\d+)\)/);
      if (!match || !match[1] || !match[2] || !match[3]) {
        console.warn('ColorWheel: RGB string format invalid', { rgb });
        return '#000000';
      }
      
      const r = parseInt(match[1], 10);
      const g = parseInt(match[2], 10);
      const b = parseInt(match[3], 10);
      
      // Validate parsed values
      if (isNaN(r) || isNaN(g) || isNaN(b) || 
          r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
        console.warn('ColorWheel: Invalid RGB values', { r, g, b });
        return '#000000';
      }
      
      // Clamp values to valid range
      const clampedR = Math.max(0, Math.min(255, r));
      const clampedG = Math.max(0, Math.min(255, g));
      const clampedB = Math.max(0, Math.min(255, b));
      
      const hex = `#${((1 << 24) + (clampedR << 16) + (clampedG << 8) + clampedB).toString(16).slice(1)}`;
      
      // Validate hex format
      if (!/^#[0-9a-f]{6}$/i.test(hex)) {
        console.warn('ColorWheel: Invalid hex format generated', { hex });
        return '#000000';
      }
      
      return hex;
    } catch (error) {
      console.error('ColorWheel: Error in rgbToHex', error);
      return '#000000';
    }
  };

  // Calculate color from position
  const getColorFromPosition = (x: number, y: number): string => {
    try {
      // Validate input parameters
      if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
        console.warn('ColorWheel: Invalid position coordinates', { x, y });
        return currentColor;
      }
      
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Validate calculated values
      if (isNaN(distance) || !isFinite(distance)) {
        console.warn('ColorWheel: Invalid distance calculation', { dx, dy, distance });
        return currentColor;
      }
      
      if (distance > radius) return currentColor;
      
      // Calculate angle with proper orientation (0° = red, 120° = green, 240° = blue)
      const angle = Math.atan2(-dy, dx); // Negative dy for correct orientation
      
      // Validate angle
      if (isNaN(angle) || !isFinite(angle)) {
        console.warn('ColorWheel: Invalid angle calculation', { angle, dx, dy });
        return currentColor;
      }
      
      let hue = ((angle * 180) / Math.PI + 360) % 360;
      
      // Adjust hue to match standard color wheel (red at 0°)
      hue = (360 - hue) % 360;
      
      // Validate hue
      if (isNaN(hue) || !isFinite(hue)) {
        console.warn('ColorWheel: Invalid hue calculation', { hue });
        return currentColor;
      }
      
      const saturation = Math.min(distance / radius, 1);
      const value = 1; // Full brightness
      
      // Validate saturation
      if (isNaN(saturation) || !isFinite(saturation) || saturation < 0 || saturation > 1) {
        console.warn('ColorWheel: Invalid saturation calculation', { saturation });
        return currentColor;
      }
      
      const rgb = hsvToRgb(hue, saturation, value);
      const hex = rgbToHex(rgb);
      
      // Validate final color
      if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
        console.warn('ColorWheel: Invalid color generated', { rgb, hex });
        return currentColor;
      }
      
      return hex;
    } catch (error) {
      console.error('ColorWheel: Error in getColorFromPosition', error);
      return currentColor;
    }
  };

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const notifyInteractionStart = () => {
    if (onInteractionStart) {
      onInteractionStart();
    }
  };

  const notifyInteractionEnd = () => {
    if (onInteractionEnd) {
      onInteractionEnd();
    }
  };

  // Debounced color change for performance
  const debouncedColorChange = useCallback((color: string) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      if (lastColorRef.current !== color) {
        lastColorRef.current = color;
        onColorChange?.(color);
      }
    }, debounceDelay);
  }, [onColorChange, debounceDelay]);

  const updateColor = (color: string) => {
    setCurrentColor(color);
    debouncedColorChange(color);
    
    // Add subtle animation feedback
    colorOpacity.value = withSpring(0.8, { duration: 100 });
    setTimeout(() => {
      colorOpacity.value = withSpring(1, { duration: 200 });
    }, 50);
  };
  
  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleTouch = (x: number, y: number) => {
    if (disabled) return;
    
    // Validate input parameters
    if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
      return;
    }
    
    // Check if touch is within the circle
    const dx = x - centerX;
    const dy = y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Validate calculated values
    if (isNaN(distance) || !isFinite(distance)) {
      return;
    }
    
    if (distance <= radius) {
      // Constrain to circle boundary if needed
      const constrainedDistance = Math.min(distance, radius);
      const angle = Math.atan2(dy, dx);
      
      // Validate angle calculation
      if (isNaN(angle) || !isFinite(angle)) {
        return;
      }
      
      const constrainedX = Math.cos(angle) * constrainedDistance;
      const constrainedY = Math.sin(angle) * constrainedDistance;
      
      // Validate constrained coordinates
      if (isNaN(constrainedX) || isNaN(constrainedY) || !isFinite(constrainedX) || !isFinite(constrainedY)) {
        return;
      }
      
      // Update selector position (relative to center)
      translateX.value = constrainedX;
      translateY.value = constrainedY;
      
      // Calculate color from the constrained position
      const constrainedAbsoluteX = centerX + constrainedX;
      const constrainedAbsoluteY = centerY + constrainedY;
      const color = getColorFromPosition(constrainedAbsoluteX, constrainedAbsoluteY);
      
      // Validate color before updating
      if (color && typeof color === 'string' && color.startsWith('#')) {
        updateColor(color);
      }
    }
  };

  const panGesture = Gesture.Pan()
    .onStart((event) => {
      if (disabled) return;
      
      // Use relative coordinates (x, y) which are relative to the component
      const x = event.x || 0;
      const y = event.y || 0;
      
      runOnJS(triggerHaptic)();
      runOnJS(notifyInteractionStart)();
      colorOpacity.value = withSpring(0.9, springConfig);
      runOnJS(handleTouch)(x, y);
    })
    .onUpdate((event) => {
      if (disabled) return;
      
      // Use relative coordinates (x, y) which are relative to the component
      const x = event.x || 0;
      const y = event.y || 0;
      
      runOnJS(handleTouch)(x, y);
    })
    .onEnd((event) => {
      if (disabled) return;
      
      // Use relative coordinates (x, y) which are relative to the component
      const x = event.x || 0;
      const y = event.y || 0;
      
      runOnJS(handleTouch)(x, y);
      
      runOnJS(triggerHaptic)();
      runOnJS(notifyInteractionEnd)();
      colorOpacity.value = withSpring(1, springConfig);
    })
    // Platform-specific gesture configurations
    .minDistance(isAndroid ? 2 : 1) // Android needs slightly more distance to prevent accidental triggers
    .maxPointers(1) // Ensure single touch only
    .shouldCancelWhenOutside(true) // Cancel gesture when moving outside bounds
    .runOnJS(false); // Keep gesture on UI thread for better performance

  const tapGesture = Gesture.Tap()
    .onStart((event) => {
      if (disabled) return;
      
      // Use relative coordinates (x, y) which are relative to the component
      const x = event.x || 0;
      const y = event.y || 0;
      
      runOnJS(triggerHaptic)();
      runOnJS(notifyInteractionStart)();
      runOnJS(handleTouch)(x, y);
    })
    .onEnd(() => {
      if (disabled) return;
      runOnJS(notifyInteractionEnd)();
    });

  const composedGesture = Gesture.Race(panGesture, tapGesture);

  const selectorStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: withSpring(disabled ? 0.8 : 1, springConfig) },
      ],
      opacity: colorOpacity.value,
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={styles.wheelContainer}>
          {/* Color Wheel SVG */}
          <Svg width={size} height={size} style={styles.wheel}>
            <Defs>
              <RadialGradient id="saturationGradient" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <Stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </RadialGradient>
            </Defs>
            
            {/* Create color wheel segments */}
            {Array.from({ length: 36 }, (_, i) => {
              const startAngle = (i * 10 * Math.PI) / 180;
              const endAngle = ((i + 1) * 10 * Math.PI) / 180;
              
              const x1 = centerX + Math.cos(startAngle) * 20;
              const y1 = centerY + Math.sin(startAngle) * 20;
              const x2 = centerX + Math.cos(endAngle) * 20;
              const y2 = centerY + Math.sin(endAngle) * 20;
              const x3 = centerX + Math.cos(endAngle) * radius;
              const y3 = centerY + Math.sin(endAngle) * radius;
              const x4 = centerX + Math.cos(startAngle) * radius;
              const y4 = centerY + Math.sin(startAngle) * radius;
              
              const hue = i * 10;
              const color = hsvToRgb(hue, 1, 1);
              
              const pathData = `M ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} L ${x4} ${y4} Z`;
              
              return (
                <Path
                  key={`color-segment-${i}`}
                  d={pathData}
                  fill={color}
                />
              );
            })}
            
            {/* Saturation overlay */}
            <Circle
              cx={centerX}
              cy={centerY}
              r={radius}
              fill="url(#saturationGradient)"
            />
          </Svg>
          
          {/* Color Selector */}
          <Animated.View style={[styles.selector, selectorStyle]}>
            <View style={[styles.selectorInner, { backgroundColor: currentColor }]} />
          </Animated.View>
        </Animated.View>
      </GestureDetector>
      
      {disabled && <View style={styles.disabledOverlay} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelContainer: {
    position: 'relative',
  },
  wheel: {
    borderRadius: 100,
    // Platform-specific optimizations
    ...(Platform.OS === 'ios' && {
      shadowColor: 'transparent', // Reduce shadow rendering on iOS for performance
    }),
  },
  selector: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 24,
    height: 24,
    marginTop: -12,
    marginLeft: -12,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: theme.colors.text.primary,
    backgroundColor: theme.colors.background.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: Platform.OS === 'ios' ? 0.25 : 0.15, // Reduce shadow on Android
    shadowRadius: Platform.OS === 'ios' ? 3.84 : 2,
    elevation: Platform.OS === 'android' ? 8 : 5, // Higher elevation on Android for better visibility
  },
  selectorInner: {
    flex: 1,
    borderRadius: 9,
    // Ensure smooth color transitions
    ...(Platform.OS === 'android' && {
      overflow: 'hidden', // Better clipping on Android
    }),
  },
  disabledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 100,
  },
});