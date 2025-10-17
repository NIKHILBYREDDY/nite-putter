import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Input, StarsBackground } from '../../components/ui';
import { Heading2, Body, BodySmall } from '../../components/ui/Typography';
import { theme } from '../../lib/theme';
import { useAuthStore } from '../../store';
import { validateEmail } from '../../lib/utils';
import { LoginScreenProps } from '../../types/navigation';

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { login, isLoading, error, clearError } = useAuthStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Entrance animation (header/footer only)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Clear any existing errors
    clearError();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Login Failed', error);
    }
  }, [error]);

  const validateForm = (): boolean => {
    let isValid = true;

    // Reset errors
    setEmailError('');
    setPasswordError('');

    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await login(email.trim(), password);
      // Navigation will be handled by the auth state change
    } catch (err) {
      // Error is handled by the store and useEffect
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ResetPassword');
  };

  const handleSignUp = () => {
    navigation.navigate('Signup');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={[
          theme.colors.background.primary,
          theme.colors.background.secondary,
        ]}
        style={styles.backgroundGradient}
        pointerEvents="none"
      />

      {/* Enhanced Night Sky Background */}
      <StarsBackground 
        starCount={70} 
        animated={false} 
        showClouds={true} 
        showNebula={true} 
        dynamicMotion={false} 
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          // Use padding on both platforms to avoid height thrash/flicker
          behavior={'padding'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            // Keep taps and focus stable while typing
            keyboardShouldPersistTaps="always"
            // Prevent Android clipping issues that can cause flicker
            removeClippedSubviews={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Body style={styles.backText}>← Back</Body>
              </TouchableOpacity>

              <View style={styles.titleContainer}>
                <Heading2 style={styles.title}>Welcome Back</Heading2>
                <Body style={styles.subtitle}>
                  Sign in to control your Nite Putter experience
                </Body>
              </View>
            </View>

            {/* Form (no transforms applied to avoid TextInput flicker) */}
            <View collapsable={false} style={styles.form}>
              <Input
                label="Email"
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                error={emailError}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />

              <Input
                label="Password"
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                error={passwordError}
                secureTextEntry={!showPassword}
                rightIcon={showPassword ? 'eye' : 'eye-off'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                style={styles.input}
              />

              <TouchableOpacity
                onPress={handleForgotPassword}
                style={styles.forgotPassword}
              >
                <BodySmall style={styles.forgotPasswordText}>
                  Forgot your password?
                </BodySmall>
              </TouchableOpacity>

              <Button
                title="Sign In"
                variant="primary"
                size="lg"
                onPress={handleLogin}
                loading={isLoading}
                disabled={isLoading}
                style={styles.loginButton}
              />

              {/* Demo Credentials */}
              <View style={styles.demoContainer}>
                <BodySmall style={styles.demoTitle}>Demo Credentials:</BodySmall>
                <BodySmall style={styles.demoText}>
                  Email: john.doe@example.com
                </BodySmall>
                <BodySmall style={styles.demoText}>
                  Password: password123
                </BodySmall>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <View style={styles.signupPrompt}>
                <Body style={styles.signupText}>Don't have an account? </Body>
                <TouchableOpacity onPress={handleSignUp}>
                  <Body style={styles.signupLink}>Sign up</Body>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  safeArea: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  header: {
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  backText: {
    color: theme.colors.neon.blue,
    fontSize: 16,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    flex: 1,
    paddingVertical: theme.spacing.xl,
  },
  input: {
    marginBottom: theme.spacing.lg,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.xl,
  },
  forgotPasswordText: {
    color: theme.colors.neon.blue,
    fontSize: 14,
  },
  loginButton: {
    marginBottom: theme.spacing.xl,
  },
  demoContainer: {
    backgroundColor: theme.colors.background.secondary + '40',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border.primary,
    marginBottom: theme.spacing.lg,
  },
  demoTitle: {
    color: theme.colors.neon.green,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  demoText: {
    color: theme.colors.text.tertiary,
    fontSize: 12,
    lineHeight: 16,
  },
  footer: {
    paddingBottom: theme.spacing.xl,
  },
  signupPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: theme.colors.text.secondary,
    fontSize: 16,
  },
  signupLink: {
    color: theme.colors.neon.green,
    fontSize: 16,
    fontWeight: '600',
  },
});