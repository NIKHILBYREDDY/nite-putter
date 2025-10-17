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
import { Button, Input } from '../../components/ui';
import { Heading2, Body, BodySmall } from '../../components/ui/Typography';
import { theme } from '../../lib/theme';
import { useAuthStore } from '../../store';
import { validateEmail } from '../../lib/utils';
import { ResetPasswordScreenProps } from '../../types/navigation';

export const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { resetPassword, isLoading, error, clearError } = useAuthStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
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
      Alert.alert('Reset Failed', error);
    }
  }, [error]);

  useEffect(() => {
    if (isSubmitted) {
      // Success animation
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [isSubmitted]);

  const validateForm = (): boolean => {
    setEmailError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    try {
      await resetPassword(email.trim());
      setIsSubmitted(true);
    } catch (err) {
      // Error is handled by the store and useEffect
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleResendEmail = async () => {
    if (!validateForm()) return;

    try {
      await resetPassword(email.trim());
      Alert.alert('Email Sent', 'Password reset email has been sent again.');
    } catch (err) {
      // Error is handled by the store and useEffect
    }
  };

  if (isSubmitted) {
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

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.successContainer}>
            <Animated.View
              style={[
                styles.successContent,
                {
                  opacity: successAnim,
                  transform: [
                    {
                      scale: successAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              {/* Success Icon */}
              <View style={styles.successIcon}>
                <Body style={styles.successEmoji}>📧</Body>
              </View>

              <Heading2 style={styles.successTitle}>Check Your Email</Heading2>
              
              <Body style={styles.successMessage}>
                We've sent a password reset link to:
              </Body>
              
              <Body style={styles.emailDisplay}>{email}</Body>
              
              <BodySmall style={styles.successInstructions}>
                Click the link in the email to reset your password. 
                If you don't see it, check your spam folder.
              </BodySmall>

              <View style={styles.successActions}>
                <Button
                  title="Back to Sign In"
                  variant="primary"
                  size="lg"
                  onPress={handleBackToLogin}
                  style={styles.actionButton}
                />

                <Button
                  title="Resend Email"
                  variant="outline"
                  size="md"
                  onPress={handleResendEmail}
                  loading={isLoading}
                  disabled={isLoading}
                  style={styles.actionButton}
                />
              </View>
            </Animated.View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient colors={[theme.colors.background.primary, theme.colors.background.secondary]} style={styles.backgroundGradient} pointerEvents="none" />
      <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        removeClippedSubviews={false}
      >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Body style={styles.backText}>← Back</Body>
              </TouchableOpacity>

              <View style={styles.titleContainer}>
                <Heading2 style={styles.title}>Reset Password</Heading2>
                <Body style={styles.subtitle}>
                  Enter your email address and we'll send you a link to reset your password
                </Body>
              </View>
            </View>

            {/* Form */}
            <View collapsable={false} style={styles.form}>
              <Input
                label="Email"
                placeholder="Enter your email address"
                value={email}
                onChangeText={setEmail}
                error={emailError}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />

              <Button
                title="Send Reset Link"
                variant="primary"
                size="lg"
                onPress={handleResetPassword}
                loading={isLoading}
                disabled={isLoading}
                style={styles.resetButton}
              />

              {/* Help Text */}
              <View style={styles.helpContainer}>
                <BodySmall style={styles.helpText}>
                  Remember your password?{' '}
                  <TouchableOpacity onPress={handleBackToLogin}>
                    <BodySmall style={styles.helpLink}>Sign in instead</BodySmall>
                  </TouchableOpacity>
                </BodySmall>
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
    justifyContent: 'center',
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
    paddingHorizontal: theme.spacing.md,
  },
  form: {
    flex: 1,
    paddingVertical: theme.spacing.xl,
    justifyContent: 'center',
  },
  input: {
    marginBottom: theme.spacing.xl,
  },
  resetButton: {
    marginBottom: theme.spacing.lg,
  },
  helpContainer: {
    alignItems: 'center',
  },
  helpText: {
    color: theme.colors.text.secondary,
    fontSize: 14,
    textAlign: 'center',
  },
  helpLink: {
    color: theme.colors.neon.blue,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  // Success screen styles
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  successContent: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.neon.green + '20',
    borderWidth: 2,
    borderColor: theme.colors.neon.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  successEmoji: {
    fontSize: 32,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emailDisplay: {
    fontSize: 16,
    color: theme.colors.neon.green,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  successInstructions: {
    fontSize: 14,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  successActions: {
    width: '100%',
    gap: theme.spacing.md,
  },
  actionButton: {
    width: '100%',
  },
});