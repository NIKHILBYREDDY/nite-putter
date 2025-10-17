import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { ColorWheel } from '../../components/ui/ColorWheel';
import { colors } from '../../lib/theme';
import { useNiteControlStore } from '../../store/niteControlStore';
import { ColorWheelScreenProps } from '../../types/navigation';
import { kelvinToHex, clamp } from '../../lib/colorUtils';

const { width } = Dimensions.get('window');

type TabKey = 'color' | 'temperature' | 'swatch';

export const ColorWheelScreen: React.FC<ColorWheelScreenProps> = ({ navigation, route }) => {
  const { cupId, currentColor } = route.params || ({} as any);
  const { cups, setCupColor, setCupBrightness } = useNiteControlStore();

  const initialColor = (typeof currentColor === 'string' && currentColor.startsWith('#') && (currentColor.length === 7 || currentColor.length === 9))
    ? currentColor
    : '#00FF88';
  const cup = cups.find(c => c.id === cupId);
  const initialBrightness = typeof cup?.brightness === 'number' ? cup!.brightness : 22;

  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [brightness, setBrightness] = useState(initialBrightness);
  const [activeTab, setActiveTab] = useState<TabKey>('color');
  const [isApplying, setIsApplying] = useState(false);
  const [kelvin, setKelvin] = useState<number>(4000);

  // Animations
  const fadeAnimRef = useRef(new Animated.Value(0));
  const slideAnimRef = useRef(new Animated.Value(40));
  const colorPreviewScaleRef = useRef(new Animated.Value(1));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnimRef.current, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimRef.current, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    Animated.sequence([
      Animated.timing(colorPreviewScaleRef.current, { toValue: 1.06, duration: 90, useNativeDriver: true }),
      Animated.timing(colorPreviewScaleRef.current, { toValue: 1, duration: 90, useNativeDriver: true }),
    ]).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Brightness slider drag handling
  const [trackWidth, setTrackWidth] = useState<number>(0);
  const updateBrightnessByX = (x: number) => {
    if (trackWidth <= 0) return;
    const ratio = Math.max(0, Math.min(1, x / trackWidth));
    const next = Math.round(ratio * 100);
    setBrightness(next);
  };

  // Temperature (Kelvin) slider drag handling
  const [tempTrackWidth, setTempTrackWidth] = useState<number>(0);
  const updateKelvinByX = (x: number) => {
    if (tempTrackWidth <= 0) return;
    const ratio = clamp(x / tempTrackWidth, 0, 1);
    const nextKelvin = Math.round(1000 + ratio * (6500 - 1000));
    setKelvin(nextKelvin);
    const nextColor = kelvinToHex(nextKelvin);
    setSelectedColor(nextColor);
    Animated.sequence([
      Animated.timing(colorPreviewScaleRef.current, { toValue: 1.05, duration: 80, useNativeDriver: true }),
      Animated.timing(colorPreviewScaleRef.current, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleConfirm = async () => {
    try {
      setIsApplying(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await Promise.all([
        setCupColor(cupId, selectedColor),
        setCupBrightness(cupId, brightness),
      ]);
      navigation.goBack();
    } catch (e) {
      // Swallow and continue — mock environment
    } finally {
      setIsApplying(false);
    }
  };

  const presetColors = [
    colors.neon.green,
    colors.neon.blue,
    colors.neon.purple,
    colors.neon.pink,
    colors.neon.orange,
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[colors.background.primary, colors.background.secondary]} style={styles.gradient}>
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnimRef.current, transform: [{ translateY: slideAnimRef.current }] }] }>
          <TouchableOpacity style={styles.headerIcon} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Ionicons name="close" size={20} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Light Color</Text>
          <TouchableOpacity style={[styles.headerIcon, styles.confirmIcon]} onPress={handleConfirm} disabled={isApplying} activeOpacity={0.8}>
            <Ionicons name="checkmark" size={20} color={colors.text.primary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Tabs */}
        <View style={styles.tabsOuter}>
          <View style={styles.tabsInner}>
            {(['color','temperature','swatch'] as TabKey[]).map(key => (
              <TouchableOpacity
                key={key}
                style={[styles.tabButton, activeTab === key && styles.tabButtonActive]}
                onPress={() => setActiveTab(key)}
                activeOpacity={0.85}
              >
                <Text style={[styles.tabText, activeTab === key && styles.tabTextActive]}>
                  {key === 'color' ? 'Color' : key === 'temperature' ? 'Temperature' : 'Swatch'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Color Wheel Card */}
        {activeTab === 'color' && (
          <Animated.View style={[styles.card, styles.wheelCard, { opacity: fadeAnimRef.current, transform: [{ translateY: slideAnimRef.current }] }] }>
            <ColorWheel size={Math.min(width * 0.82, 320)} onColorChange={handleColorChange} initialColor={selectedColor} />
          </Animated.View>
        )}

        {/* Temperature Card */}
        {activeTab === 'temperature' && (
          <Animated.View style={[styles.card, { opacity: fadeAnimRef.current, transform: [{ translateY: slideAnimRef.current }] }] }>
            <Text style={styles.brightnessLabel}>TEMPERATURE</Text>
            <View style={styles.brightnessRow}>
              <View
                style={styles.tempSliderTrack}
                onLayout={(e) => setTempTrackWidth(e.nativeEvent.layout.width)}
                onStartShouldSetResponder={() => true}
                onResponderMove={(e) => updateKelvinByX(e.nativeEvent.locationX)}
                onResponderRelease={(e) => updateKelvinByX(e.nativeEvent.locationX)}
              >
                <LinearGradient
                  colors={["#FFB56B", "#FFFFFF", "#8CB4FF"]}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={styles.tempSliderFill}
                />
                <View
                  style={[
                    styles.sliderThumb,
                    {
                      left:
                        tempTrackWidth > 0
                          ? Math.max(
                              0,
                              Math.min(
                                tempTrackWidth - 26,
                                Math.round(((kelvin - 1000) / (6500 - 1000)) * tempTrackWidth) - 13
                              )
                            )
                          : 0,
                    },
                  ]}
                />
              </View>
              <View style={styles.brightnessValueBox}>
                <Text style={styles.brightnessValueText}>{kelvin}K</Text>
              </View>
            </View>

            <View style={styles.presetsRow}>
              <View style={[styles.bigSwatch, { backgroundColor: selectedColor }]}> 
                <LinearGradient colors={[selectedColor + '00', selectedColor + '60']} style={styles.bigSwatchOverlay} />
              </View>
              <View style={styles.smallSwatchesRow}>
                {[1500, 2700, 3500, 4500, 5500, 6500].map((k) => (
                  <TouchableOpacity
                    key={k}
                    style={[styles.smallSwatch, { backgroundColor: kelvinToHex(k) }]}
                    onPress={() => {
                      setKelvin(k);
                      const next = kelvinToHex(k);
                      setSelectedColor(next);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  />
                ))}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Brightness Card */}
        <View style={[styles.card, styles.brightnessCard]}> 
          <Text style={styles.brightnessLabel}>BRIGHTNESS</Text>
          <View style={styles.brightnessRow}>
            <View
              style={styles.sliderTrack}
              onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
              onStartShouldSetResponder={() => true}
              onResponderMove={(e) => updateBrightnessByX(e.nativeEvent.locationX)}
              onResponderRelease={(e) => updateBrightnessByX(e.nativeEvent.locationX)}
            >
              <View
                style={[
                  styles.sliderFill,
                  { width: trackWidth > 0 ? (brightness / 100) * trackWidth : 0 },
                ]}
              />
              <View
                style={[
                  styles.sliderThumb,
                  {
                    left:
                      trackWidth > 0
                        ? Math.max(
                            0,
                            Math.min(trackWidth - 26, Math.round((brightness / 100) * trackWidth) - 13)
                          )
                        : 0,
                  },
                ]}
              />
            </View>
            <View style={styles.brightnessValueBox}>
              <Text style={styles.brightnessValueText}>{brightness}%</Text>
            </View>
          </View>

          {/* Presets Row */}
          <View style={styles.presetsRow}>
            <View style={[styles.bigSwatch, { backgroundColor: selectedColor }]}> 
              <LinearGradient colors={[selectedColor + '00', selectedColor + '60']} style={styles.bigSwatchOverlay} />
            </View>
            <View style={styles.smallSwatchesRow}>
              {presetColors.map((c, idx) => (
                <TouchableOpacity key={idx} style={[styles.smallSwatch, { backgroundColor: c }]} onPress={() => handleColorChange(c)} />
              ))}
              <TouchableOpacity style={[styles.smallSwatch, styles.addSwatch]} onPress={() => handleColorChange('#FFFFFF')} activeOpacity={0.85}>
                <Ionicons name="add" size={16} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.primary },
  gradient: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background.tertiary,
    borderWidth: 1,
    borderColor: colors.border.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmIcon: { backgroundColor: colors.neon.orange + '20' },
  headerTitle: { color: colors.text.primary, fontWeight: '700', fontSize: 18 },

  tabsOuter: { paddingHorizontal: 16, marginBottom: 10 },
  tabsInner: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 18,
    padding: 4,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border.secondary,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabButtonActive: { backgroundColor: colors.background.secondary },
  tabText: { color: colors.text.secondary, fontWeight: '600' },
  tabTextActive: { color: colors.text.primary },

  card: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border.secondary,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
  },
  wheelCard: { alignItems: 'center' },

  brightnessCard: {},
  brightnessLabel: { color: colors.text.secondary, fontSize: 12, fontWeight: '700', marginBottom: 12 },
  brightnessRow: { flexDirection: 'row', alignItems: 'center' },
  sliderTrack: { flex: 1, height: 18, borderRadius: 9, backgroundColor: '#2A2A2A', overflow: 'hidden' },
  sliderFill: { height: '100%', backgroundColor: '#3F3F3F' },
  tempSliderTrack: { flex: 1, height: 18, borderRadius: 9, backgroundColor: '#2A2A2A', overflow: 'hidden', position: 'relative' },
  tempSliderFill: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  sliderThumb: {
    position: 'absolute',
    top: -4,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.secondary,
  },
  brightnessValueBox: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.secondary,
  },
  brightnessValueText: { color: colors.text.primary, fontWeight: '600' },

  presetsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  bigSwatch: { width: 64, height: 64, borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: colors.border.secondary },
  bigSwatchOverlay: { flex: 1 },
  smallSwatchesRow: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  smallSwatch: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: colors.border.secondary, marginRight: 10 },
  addSwatch: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.secondary },
});