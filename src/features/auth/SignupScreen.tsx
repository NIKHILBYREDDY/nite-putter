import React, { useState, useRef, useEffect, useCallback } from 'react';
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
import { Button, Input, Switch, StarsBackground } from '../../components/ui';
import { Heading2, Body, BodySmall } from '../../components/ui/Typography';
import { theme } from '../../lib/theme';
import { useAuthStore } from '../../store';
import { validateEmail, validatePassword } from '../../lib/utils';
import { SignupScreenProps } from '../../types/navigation';

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptMarketing, setAcceptMarketing] = useState(false);

  const { signup, isLoading, error, clearError } = useAuthStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Clear any existing errors
    clearError();
    
    // Entrance animation with reduced duration to minimize conflicts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Signup Failed', error);
    }
  }, [error]);

  // Ultra-stable form handlers for Android - no dependencies at all
  const handleFirstNameChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, firstName: value }));
    setErrors(prev => prev.firstName ? { ...prev, firstName: '' } : prev);
  }, []);

  const handleLastNameChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, lastName: value }));
    setErrors(prev => prev.lastName ? { ...prev, lastName: '' } : prev);
  }, []);

  const handleEmailChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, email: value }));
    setErrors(prev => prev.email ? { ...prev, email: '' } : prev);
  }, []);

  const handlePasswordChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, password: value }));
    setErrors(prev => prev.password ? { ...prev, password: '' } : prev);
  }, []);

  const handleConfirmPasswordChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, confirmPassword: value }));
    setErrors(prev => prev.confirmPassword ? { ...prev, confirmPassword: '' } : prev);
  }, []);

  const validateForm = (): boolean => {
    let isValid = true;
    const newErrors = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      isValid = false;
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
      isValid = false;
    }

    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      isValid = false;
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
      isValid = false;
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, and number';
      isValid = false;
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    if (!acceptTerms) {
      Alert.alert('Terms Required', 'Please accept the Terms of Service to continue');
      return;
    }

    try {
      await signup(
        formData.email.trim(),
        formData.password,
        formData.firstName.trim(),
        formData.lastName.trim()
      );
      // Navigation will be handled by the auth state change
    } catch (err) {
      // Error is handled by the store and useEffect
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleTermsPress = () => {
    // Navigate to terms screen or open modal
    Alert.alert('Terms of Service', 'Terms of Service content would be displayed here.');
  };

  const handlePrivacyPress = () => {
    // Navigate to privacy screen or open modal
    Alert.alert('Privacy Policy', 'Privacy Policy content would be displayed here.');
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
      />

      {/* Enhanced Night Sky Background */}
      <StarsBackground 
        starCount={70} 
        animated={true} 
        showClouds={true} 
        showNebula={true} 
        dynamicMotion={true} 
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <Animated.View
              style={[
                styles.header,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Body style={styles.backText}>← Back</Body>
              </TouchableOpacity>

              <View style={styles.titleContainer}>
                <Heading2 style={styles.title}>Create Account</Heading2>
                <Body style={styles.subtitle}>
                  Join the Nite Putter community and start your glow golf journey
                </Body>
              </View>
            </Animated.View>

            {/* Form */}
            <Animated.View
              style={[
                styles.form,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.nameRow}>
                <Input
                  label="First Name"
                  placeholder="First name"
                  value={formData.firstName}
                  onChangeText={handleFirstNameChange}
                  error={errors.firstName}
                  autoCapitalize="words"
                  style={[styles.input, styles.nameInput]}
                />
                <Input
                  label="Last Name"
                  placeholder="Last name"
                  value={formData.lastName}
                  onChangeText={handleLastNameChange}
                  error={errors.lastName}
                  autoCapitalize="words"
                  style={[styles.input, styles.nameInput]}
                />
              </View>

              <Input
                label="Email"
                placeholder="Enter your email"
                value={formData.email}
                onChangeText={handleEmailChange}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />

              <Input
                label="Password"
                placeholder="Create a password"
                value={formData.password}
                onChangeText={handlePasswordChange}
                error={errors.password}
                secureTextEntry={!showPassword}
                rightIcon={showPassword ? 'eye' : 'eye-off'}
                onRightIconPress={() => setShowPassword(!showPassword)}
                style={styles.input}
              />

              <Input
                label="Confirm Password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                error={errors.confirmPassword}
                secureTextEntry={!showConfirmPassword}
                rightIcon={showConfirmPassword ? 'eye' : 'eye-off'}
                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.input}
              />

              {/* Terms and Marketing */}
              <View style={styles.checkboxContainer}>
                <View style={styles.checkboxRow}>
                  <Switch
                    value={acceptTerms}
                    onValueChange={setAcceptTerms}
                    size="sm"
                  />
                  <View style={styles.checkboxText}>
                    <BodySmall style={styles.termsText}>
                      I agree to the{' '}
                      <TouchableOpacity onPress={handleTermsPress}>
                        <BodySmall style={styles.linkText}>Terms of Service</BodySmall>
                      </TouchableOpacity>
                      {' '}and{' '}
                      <TouchableOpacity onPress={handlePrivacyPress}>
                        <BodySmall style={styles.linkText}>Privacy Policy</BodySmall>
                      </TouchableOpacity>
                    </BodySmall>
                  </View>
                </View>

                <View style={styles.checkboxRow}>
                  <Switch
                    value={acceptMarketing}
                    onValueChange={setAcceptMarketing}
                    size="sm"
                  />
                  <View style={styles.checkboxText}>
                    <BodySmall style={styles.termsText}>
                      I'd like to receive marketing emails about new products and features
                    </BodySmall>
                  </View>
                </View>
              </View>

              <Button
                title="Create Account"
                variant="primary"
                size="lg"
                onPress={handleSignup}
                loading={isLoading}
                disabled={isLoading}
                style={styles.signupButton}
              />
            </Animated.View>

            {/* Footer */}
            <Animated.View
              style={[
                styles.footer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.loginPrompt}>
                <Body style={styles.loginText}>Already have an account? </Body>
                <TouchableOpacity onPress={handleLogin}>
                  <Body style={styles.loginLink}>Sign in</Body>
                </TouchableOpacity>
              </View>
            </Animated.View>
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
  nameRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  nameInput: {
    flex: 1,
  },
  input: {
    marginBottom: theme.spacing.lg,
  },
  checkboxContainer: {
    marginBottom: theme.spacing.xl,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  checkboxText: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  termsText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  linkText: {
    color: theme.colors.neon.blue,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  signupButton: {
    marginBottom: theme.spacing.xl,
  },
  footer: {
    paddingBottom: theme.spacing.xl,
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: theme.colors.text.secondary,
    fontSize: 16,
  },
  loginLink: {
    color: theme.colors.neon.green,
    fontSize: 16,
    fontWeight: '600',
  },
});