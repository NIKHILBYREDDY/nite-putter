import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, StarsBackground } from '../../components/ui';
import { Heading1, Body, NeonText } from '../../components/ui/Typography';
import { theme } from '../../lib/theme';
import { WelcomeScreenProps } from '../../types/navigation';

// Dimensions available if needed for responsive design
// const { width, height } = Dimensions.get('window');

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous glow animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    glowAnimation.start();

    return () => glowAnimation.stop();
  }, []);

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={[
          theme.colors.background.primary,
          theme.colors.background.secondary,
          theme.colors.background.tertiary,
        ]}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Enhanced Night Sky Background */}
      <StarsBackground 
        starCount={80} 
        animated={true} 
        showClouds={true} 
        showNebula={true} 
        dynamicMotion={true} 
      />

      {/* Animated Background Elements */}
      <Animated.View
        style={[
          styles.glowCircle,
          styles.glowCircle1,
          {
            opacity: glowAnim,
            transform: [
              {
                scale: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1.2],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[theme.colors.neon.green + '40', 'transparent']}
          style={styles.glowGradient}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.glowCircle,
          styles.glowCircle2,
          {
            opacity: glowAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 0.8],
            }),
            transform: [
              {
                scale: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1.2, 0.8],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[theme.colors.neon.blue + '40', 'transparent']}
          style={styles.glowGradient}
        />
      </Animated.View>

      <SafeAreaView style={styles.content}>
        {/* Logo/Brand Section */}
        <Animated.View
          style={[
            styles.logoSection,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {/* Logo placeholder - replace with actual logo */}
          <View style={styles.logoContainer}>
            <LinearGradient
              colors={[theme.colors.neon.green, theme.colors.neon.blue]}
              style={styles.logoGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <NeonText style={styles.logoText}>NP</NeonText>
            </LinearGradient>
          </View>

          <View style={styles.titleContainer}>
            <Heading1 style={styles.title}>Nite Putter</Heading1>
            <Body style={styles.subtitle}>
              Illuminate your night golf experience
            </Body>
          </View>
        </Animated.View>

        {/* Features Section */}
        <Animated.View
          style={[
            styles.featuresSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: theme.colors.neon.green + '20' }]}>
              <NeonText style={styles.featureIconText}>🌟</NeonText>
            </View>
            <Body style={styles.featureText}>Control LED cups wirelessly</Body>
          </View>

          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: theme.colors.neon.blue + '20' }]}>
              <NeonText style={styles.featureIconText}>🎨</NeonText>
            </View>
            <Body style={styles.featureText}>16 million color combinations</Body>
          </View>

          <View style={styles.feature}>
            <View style={[styles.featureIcon, { backgroundColor: theme.colors.neon.purple + '20' }]}>
              <NeonText style={styles.featureIconText}>⚡</NeonText>
            </View>
            <Body style={styles.featureText}>Dynamic lighting modes</Body>
          </View>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          style={[
            styles.actionSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Button
            title="Sign In"
            variant="primary"
            size="lg"
            onPress={handleLogin}
            style={styles.loginButton}
          />

          <Button
            title="Create Account"
            variant="outline"
            size="lg"
            onPress={handleSignup}
            style={styles.signupButton}
          />

          <Body style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Body>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  glowCircle: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  glowCircle1: {
    top: -100,
    right: -100,
  },
  glowCircle2: {
    bottom: -150,
    left: -100,
  },
  glowGradient: {
    flex: 1,
    borderRadius: 150,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: theme.spacing.xl,
  },
  logoContainer: {
    marginBottom: theme.spacing.xl,
  },
  logoGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.neon,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresSection: {
    paddingVertical: theme.spacing.xl,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
  },
  featureIconText: {
    fontSize: 24,
  },
  featureText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  actionSection: {
    paddingBottom: theme.spacing.xl,
  },
  loginButton: {
    marginBottom: theme.spacing.md,
  },
  signupButton: {
    marginBottom: theme.spacing.lg,
  },
  termsText: {
    fontSize: 12,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: theme.spacing.md,
  },
});