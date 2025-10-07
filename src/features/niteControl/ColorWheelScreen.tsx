import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ColorWheel } from '../../components/ui/ColorWheel';
import { Button } from '../../components/ui/Button';
import { colors } from '../../lib/theme';
import { useNiteControlStore } from '../../store/niteControlStore';
import { ColorWheelScreenProps } from '../../types/navigation';

const { width } = Dimensions.get('window');

export const ColorWheelScreen: React.FC<ColorWheelScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { cupId, cupName, currentColor } = route.params || ({} as any);
  const { setCupColor } = useNiteControlStore();
  
  const initialColor = (typeof currentColor === 'string' && currentColor.startsWith('#') && (currentColor.length === 7 || currentColor.length === 9))
    ? currentColor
    : '#00FF88';
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [isApplying, setIsApplying] = useState(false);
  
  // Animation values
  const fadeAnimRef = useRef(new Animated.Value(0));
  const slideAnimRef = useRef(new Animated.Value(50));
  const colorPreviewScaleRef = useRef(new Animated.Value(1));

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnimRef.current, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimRef.current, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    
    // Animate color preview
    Animated.sequence([
      Animated.timing(colorPreviewScaleRef.current, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(colorPreviewScaleRef.current, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleApplyColor = async () => {
    try {
      setIsApplying(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Simulate applying color to cup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCupColor(cupId, selectedColor);
      
      Alert.alert(
        'Color Applied!',
        `${cupName} has been updated to the new color.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to apply color. Please try again.');
    } finally {
      setIsApplying(false);
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const presetColors = [
    colors.neon.green,
    colors.neon.blue,
    colors.neon.purple,
    colors.neon.pink,
    colors.neon.yellow,
    colors.neon.orange,
    '#FF0080', // Hot pink
    '#00FFFF', // Cyan
  ];

  const handlePresetColor = (color: string) => {
    handleColorChange(color);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={styles.gradient}
      >
        {/* Header */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnimRef.current,
              transform: [{ translateY: slideAnimRef.current }],
            },
          ]}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="chevron-back" 
              size={28} 
              color={colors.neon.blue} 
            />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Text style={styles.title}>Customize Color</Text>
            <Text style={styles.subtitle}>{cupName}</Text>
          </View>
          
          <View style={styles.headerRight} />
        </Animated.View>

        {/* Color Preview */}
        <Animated.View 
          style={[
            styles.colorPreviewContainer,
            {
              opacity: fadeAnimRef.current,
              transform: [
                { translateY: slideAnimRef.current },
                { scale: colorPreviewScaleRef.current },
              ],
            },
          ]}
        >
          <View style={styles.colorPreviewWrapper}>
            <LinearGradient
              colors={[selectedColor, selectedColor + '80']}
              style={styles.colorPreview}
            >
              <View style={[styles.colorPreviewInner, { backgroundColor: selectedColor }]} />
            </LinearGradient>
            <Text style={styles.colorValue}>{selectedColor.toUpperCase()}</Text>
          </View>
        </Animated.View>

        {/* Color Wheel */}
        <Animated.View 
          style={[
            styles.colorWheelContainer,
            {
              opacity: fadeAnimRef.current,
              transform: [{ translateY: slideAnimRef.current }],
            },
          ]}
        >
          <ColorWheel
            size={width * 0.8}
            onColorChange={handleColorChange}
            initialColor={selectedColor}
          />
        </Animated.View>

        {/* Preset Colors */}
        <Animated.View 
          style={[
            styles.presetsContainer,
            {
              opacity: fadeAnimRef.current,
              transform: [{ translateY: slideAnimRef.current }],
            },
          ]}
        >
          <Text style={styles.presetsTitle}>Quick Colors</Text>
          <View style={styles.presetsGrid}>
            {presetColors.map((color, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.presetColor,
                  { backgroundColor: color },
                  selectedColor === color && styles.presetColorSelected,
                ]}
                onPress={() => handlePresetColor(color)}
                activeOpacity={0.7}
              >
                {selectedColor === color && (
                  <Ionicons 
                    name="checkmark" 
                    size={16} 
                    color={colors.text.primary} 
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Apply Button */}
        <Animated.View 
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnimRef.current,
              transform: [{ translateY: slideAnimRef.current }],
            },
          ]}
        >
          <Button
            title={isApplying ? "Applying..." : "Apply Color"}
            onPress={handleApplyColor}
            disabled={isApplying || selectedColor === currentColor}
            style={selectedColor === currentColor ? 
              {...styles.applyButton, ...styles.applyButtonDisabled} : 
              styles.applyButton
            }
            loading={isApplying}
          />
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.secondary,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 44,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  colorPreviewContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  colorPreviewWrapper: {
    alignItems: 'center',
  },
  colorPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  colorPreviewInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.text.primary,
  },
  colorValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
    fontFamily: 'monospace',
  },
  colorWheelContainer: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border.secondary,
    alignItems: 'center',
  },
  presetsContainer: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border.secondary,
  },
  presetsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  presetColor: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetColorSelected: {
    borderColor: colors.text.primary,
    borderWidth: 3,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 20,
  },
  applyButton: {
    backgroundColor: colors.neon.blue,
    borderRadius: 16,
    paddingVertical: 16,
  },
  applyButtonDisabled: {
    backgroundColor: colors.background.tertiary,
    opacity: 0.5,
  },
});