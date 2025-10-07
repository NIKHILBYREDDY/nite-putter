import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { useNiteControlStore } from '../../store/niteControlStore';
import { Switch, ColorWheel } from '../../components/ui';
import { NiteControlScreenProps } from '../../types/navigation';

const { width } = Dimensions.get('window');

const PRESET_COLORS = [
  { name: 'Neon Green', color: '#00ff88', hex: '#00ff88' },
  { name: 'Electric Blue', color: '#0088ff', hex: '#0088ff' },
  { name: 'Purple Glow', color: '#8800ff', hex: '#8800ff' },
  { name: 'Sunset Orange', color: '#ff4400', hex: '#ff4400' },
  { name: 'Hot Pink', color: '#ff0088', hex: '#ff0088' },
  { name: 'Cyan Bright', color: '#00ffff', hex: '#00ffff' },
  { name: 'Lime Punch', color: '#88ff00', hex: '#88ff00' },
  { name: 'Deep Red', color: '#ff0044', hex: '#ff0044' },
];

export const NiteControlScreen: React.FC<NiteControlScreenProps> = ({ navigation }) => {
  const {
    cups,
    currentColor,
    currentBrightness,
    connectToCup,
    disconnectFromCup,

    setColor,
  } = useNiteControlStore();

  // Get the first connected cup for display purposes
  const connectedCup = cups.find(cup => cup.isConnected);
  const isConnected = !!connectedCup;
  const batteryLevel = connectedCup?.batteryLevel || 0;
  const selectedColor = currentColor;
  const brightness = currentBrightness;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [isScanning, setIsScanning] = useState(false);
  const [isLightOn, setIsLightOn] = useState(true);
  const [isAmbientMode, setIsAmbientMode] = useState(false);
  const [ambientSpeed, _setAmbientSpeed] = useState(50);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for connection status
    if (isConnected) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isConnected]);

  const handleConnect = async () => {
    setIsScanning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      // Connect to the first available cup
      const availableCup = cups.find(cup => !cup.isConnected);
      if (availableCup) {
        await connectToCup(availableCup.id);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert('No Cups Available', 'No Nite Cups are available to connect to.');
      }
    } catch (error) {
      Alert.alert('Connection Failed', 'Could not connect to Nite Cup. Make sure it\'s nearby and powered on.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      'Disconnect Cup',
      'Are you sure you want to disconnect from your Nite Cup?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: () => {
            if (connectedCup) {
              disconnectFromCup(connectedCup.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
        },
      ]
    );
  };

  const handleColorSelect = (color: string) => {
    setColor(color);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };



  const toggleLight = () => {
    setIsLightOn(!isLightOn);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const toggleAmbientMode = () => {
    setIsAmbientMode(!isAmbientMode);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };



  const ConnectionStatus = () => (
    <View style={styles.connectionCard}>
      <LinearGradient
        colors={
          isConnected
            ? [theme.colors.success.primary, theme.colors.success.secondary]
            : [theme.colors.background.secondary, theme.colors.background.tertiary]
        }
        style={styles.connectionGradient}
      >
        <Animated.View style={[styles.connectionIcon, { transform: [{ scale: pulseAnim }] }]}>
          <Ionicons
            name={isConnected ? 'bluetooth' : 'bluetooth-outline'}
            size={32}
            color={isConnected ? theme.colors.text.primary : theme.colors.text.secondary}
          />
        </Animated.View>
        
        <Text style={[styles.connectionTitle, { color: isConnected ? theme.colors.text.primary : theme.colors.text.secondary }]}>
          {isConnected ? 'Connected to Nite Cup' : 'Not Connected'}
        </Text>
        
        {isConnected && (
          <View style={styles.batteryContainer}>
            <Ionicons name="battery-half" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.batteryText}>{batteryLevel}%</Text>
          </View>
        )}
        
        <TouchableOpacity
          style={styles.connectionButton}
          onPress={isConnected ? handleDisconnect : handleConnect}
          disabled={isScanning}
        >
          <Text style={styles.connectionButtonText}>
            {isScanning ? 'Scanning...' : isConnected ? 'Disconnect' : 'Connect'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );

  const ColorPicker = () => (
    <View style={styles.colorSection}>
      <Text style={styles.sectionTitle}>Cup Color</Text>
      <View style={styles.colorGrid}>
        {PRESET_COLORS.map((colorItem, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.colorOption,
              { backgroundColor: colorItem.color },
              selectedColor === colorItem.hex && styles.selectedColor,
            ]}
            onPress={() => handleColorSelect(colorItem.hex)}
            disabled={!isConnected}
          >
            {selectedColor === colorItem.hex && (
              <Ionicons name="checkmark" size={20} color={theme.colors.text.primary} />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const BrightnessControl = () => (
    <View style={styles.controlSection}>
      <Text style={styles.sectionTitle}>Brightness</Text>
      <View style={styles.brightnessContainer}>
        <Ionicons name="sunny-outline" size={20} color={theme.colors.text.secondary} />
        <View style={styles.brightnessSlider}>
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: `${brightness}%` }]} />
            <TouchableOpacity
              style={[styles.sliderThumb, { left: `${brightness - 2}%` }]}
              disabled={!isConnected}
            />
          </View>
        </View>
        <Ionicons name="sunny" size={20} color={theme.colors.text.secondary} />
      </View>
      <Text style={styles.brightnessValue}>{brightness}%</Text>
    </View>
  );

  const QuickControls = () => (
    <View style={styles.quickControls}>
      <Text style={styles.sectionTitle}>Quick Controls</Text>
      
      <View style={styles.controlRow}>
        <View style={styles.controlItem}>
          <Text style={styles.controlLabel}>Cup Light</Text>
          <Switch
            value={isLightOn}
            onValueChange={toggleLight}
            disabled={!isConnected}
          />
        </View>
        
        <TouchableOpacity
          style={[styles.quickButton, !isConnected && styles.disabledButton]}
          onPress={() => {
            handleColorSelect('#00ff88');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          disabled={!isConnected}
        >
          <Ionicons name="flash" size={20} color={theme.colors.text.primary} />
          <Text style={styles.quickButtonText}>Strobe</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickButton, !isConnected && styles.disabledButton]}
          onPress={() => {
            handleColorSelect('#ff0088');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          disabled={!isConnected}
        >
          <Ionicons name="heart" size={20} color={theme.colors.text.primary} />
          <Text style={styles.quickButtonText}>Party</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const AmbientMode = () => (
    <View style={styles.controlSection}>
      <Text style={styles.sectionTitle}>Ambient Mode</Text>
      <Text style={styles.sectionDescription}>
        Automatically cycle through colors for a dynamic lighting experience
      </Text>
      
      <View style={styles.ambientControls}>
        <View style={styles.controlItem}>
          <Text style={styles.controlLabel}>Enable Ambient</Text>
          <Switch
            value={isAmbientMode}
            onValueChange={toggleAmbientMode}
            disabled={!isConnected}
          />
        </View>
        
        {isAmbientMode && (
          <View style={styles.ambientSpeedContainer}>
            <Text style={styles.controlLabel}>Transition Speed</Text>
            <View style={styles.speedSlider}>
              <Ionicons name="remove" size={16} color={theme.colors.text.secondary} />
              <View style={styles.sliderTrack}>
                <View style={[styles.sliderFill, { width: `${ambientSpeed}%` }]} />
                <TouchableOpacity
                  style={[styles.sliderThumb, { left: `${ambientSpeed - 2}%` }]}
                  disabled={!isConnected}
                />
              </View>
              <Ionicons name="add" size={16} color={theme.colors.text.secondary} />
            </View>
            <Text style={styles.speedValue}>{ambientSpeed}%</Text>
          </View>
        )}
        
        {isAmbientMode && (
          <View style={styles.ambientPreview}>
            <Text style={styles.previewLabel}>Preview:</Text>
            <View style={styles.colorCycle}>
              {PRESET_COLORS.slice(0, 4).map((color) => (
                <Animated.View
                  key={color.hex}
                  style={[
                    styles.cycleColor,
                    { backgroundColor: color.hex },
                    {
                      opacity: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.3, 1],
                      }),
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const ColorWheelSection = () => (
    <View style={styles.controlSection}>
      <Text style={styles.sectionTitle}>Color Wheel</Text>
      <Text style={styles.sectionDescription}>
        Swipe around the color wheel to select any color for your cup
      </Text>
      
      <View style={styles.colorWheelContainer}>
        <ColorWheel
          size={180}
          onColorChange={(color) => {
            setColor(color);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          initialColor={selectedColor}
          disabled={!isConnected}
          onInteractionStart={() => setScrollEnabled(false)}
          onInteractionEnd={() => setScrollEnabled(true)}
        />
        
        <View style={styles.selectedColorDisplay}>
          <Text style={styles.selectedColorLabel}>Selected Color:</Text>
          <View style={styles.selectedColorPreview}>
            <View style={[styles.colorSwatch, { backgroundColor: selectedColor }]} />
            <Text style={styles.colorHex}>{selectedColor.toUpperCase()}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.background.primary, theme.colors.background.secondary]}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} scrollEnabled={scrollEnabled}>
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <View>
                  <Text style={styles.title}>Nite Control</Text>
                  <Text style={styles.subtitle}>Control your smart golf cup</Text>
                </View>
                <TouchableOpacity
                  style={styles.multiCupButton}
                  onPress={() => navigation.navigate('MultiCupControl')}
                >
                  <Ionicons name="grid-outline" size={24} color={theme.colors.text.primary} />
                  <Text style={styles.multiCupButtonText}>Multi-Cup</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Connection Status */}
            <ConnectionStatus />

            {/* Color Picker */}
            <ColorPicker />

            {/* Brightness Control */}
            <BrightnessControl />

            {/* Quick Controls */}
            <QuickControls />

            {/* Ambient Mode */}
            <AmbientMode />

            {/* Color Wheel */}
            <ColorWheelSection />

            {/* Cup Preview */}
            <View style={styles.previewSection}>
              <Text style={styles.sectionTitle}>Cup Preview</Text>
              <View style={styles.cupPreview}>
                <LinearGradient
                  colors={[selectedColor, theme.colors.background.tertiary]}
                  style={[
                    styles.cupVisualization,
                    { opacity: isLightOn && isConnected ? brightness / 100 : 0.3 }
                  ]}
                >
                  <Ionicons name="golf" size={40} color={theme.colors.text.primary} />
                </LinearGradient>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing[4],
  },
  header: {
    marginBottom: theme.spacing[6],
    alignItems: 'center' as const,
  },
  headerContent: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    width: '100%' as const,
  },
  multiCupButton: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.background.secondary,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  multiCupButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing[1],
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  connectionCard: {
    marginBottom: theme.spacing[6],
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden' as const,
  },
  connectionGradient: {
    padding: theme.spacing[6],
    alignItems: 'center' as const,
  },
  connectionIcon: {
    marginBottom: theme.spacing[3],
  },
  connectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    marginBottom: theme.spacing[2],
  },
  batteryContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing[4],
  },
  batteryText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing[1],
  },
  connectionButton: {
    backgroundColor: theme.colors.background.primary,
    paddingHorizontal: theme.spacing[6],
    paddingVertical: theme.spacing[3],
    borderRadius: theme.borderRadius.lg,
  },
  connectionButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  colorSection: {
    marginBottom: theme.spacing[6],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[4],
  },
  colorGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
  },
  colorOption: {
    width: (width - theme.spacing[8] - theme.spacing[3] * 3) / 4,
    height: 60,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing[3],
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: theme.colors.text.primary,
    borderWidth: 3,
  },
  controlSection: {
    marginBottom: theme.spacing[6],
  },
  brightnessContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: theme.spacing[2],
  },
  brightnessSlider: {
    flex: 1,
    marginHorizontal: theme.spacing[4],
  },
  sliderTrack: {
    height: 6,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: 3,
    position: 'relative' as const,
  },
  sliderFill: {
    height: 6,
    backgroundColor: theme.colors.neon.blue,
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute' as const,
    top: -6,
    width: 18,
    height: 18,
    backgroundColor: theme.colors.text.primary,
    borderRadius: 9,
  },
  brightnessValue: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    textAlign: 'center' as const,
    marginTop: theme.spacing[2],
  },
  quickControls: {
    marginBottom: theme.spacing[6],
  },
  controlRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  controlItem: {
    flex: 1,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
    marginRight: theme.spacing[2],
  },
  controlLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  quickButton: {
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center' as const,
    marginLeft: theme.spacing[1],
    minWidth: 70,
  },
  disabledButton: {
    opacity: 0.5,
  },
  quickButtonText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.primary,
    marginTop: theme.spacing[1],
  },
  previewSection: {
    marginBottom: theme.spacing[6],
  },
  cupPreview: {
    alignItems: 'center' as const,
  },
  cupVisualization: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 3,
    borderColor: theme.colors.border.primary,
  },
  sectionDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing[4],
    lineHeight: 20,
  },
  ambientControls: {
    gap: theme.spacing[4],
  },
  ambientSpeedContainer: {
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
  },
  speedSlider: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginVertical: theme.spacing[3],
  },
  speedValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center' as const,
    marginTop: theme.spacing[2],
  },
  ambientPreview: {
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius.lg,
  },
  previewLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[3],
    fontWeight: theme.typography.fontWeight.medium,
  },
  colorCycle: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  cycleColor: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colors.border.primary,
  },
  colorWheelContainer: {
    alignItems: 'center' as const,
    gap: theme.spacing[4],
  },
  selectedColorDisplay: {
    alignItems: 'center' as const,
    gap: theme.spacing[2],
  },
  selectedColorLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  selectedColorPreview: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: theme.spacing[2],
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.lg,
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border.primary,
  },
  colorHex: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium,
    fontFamily: 'monospace',
  },
};