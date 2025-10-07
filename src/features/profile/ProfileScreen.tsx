import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../lib/theme';
import { useAuthStore } from '../../store/authStore';
import { useProfileStore } from '../../store/profileStore';
import { useNavigation } from '@react-navigation/native';
import { ProfileStackScreenProps } from '../../types/navigation';



export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { profile, updateProfile, referralData } = useProfileStore();
  const navigation = useNavigation<ProfileStackScreenProps<'ProfileMain'>['navigation']>();
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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
  }, []);

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to change your avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      updateProfile({ avatar: result.assets[0].uri });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            logout();
          },
        },
      ]
    );
  };

  const ProfileStat = ({ label, value, icon }: { label: string; value: string; icon: string }) => (
    <View style={styles.statCard}>
      <LinearGradient
        colors={[theme.colors.background.secondary, theme.colors.background.tertiary]}
        style={styles.statGradient}
      >
        <Ionicons name={icon as any} size={24} color={theme.colors.neon.green} />
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </LinearGradient>
    </View>
  );

  const MenuItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true 
  }: { 
    icon: string; 
    title: string; 
    subtitle?: string; 
    onPress: () => void; 
    showArrow?: boolean;
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconContainer}>
          <Ionicons name={icon as any} size={20} color={theme.colors.neon.blue} />
        </View>
        <View style={styles.menuItemText}>
          <Text style={styles.menuItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color={theme.colors.text.secondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.background.primary, theme.colors.background.secondary]}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
              <Text style={styles.title}>Profile</Text>
            </View>

            {/* Profile Card */}
            <View style={styles.profileCard}>
              <LinearGradient
                colors={[theme.colors.background.secondary, theme.colors.background.tertiary]}
                style={styles.profileGradient}
              >
                <TouchableOpacity onPress={handleImagePicker} style={styles.avatarContainer}>
                  <Image
                    source={{
                      uri: profile?.avatar || 'https://via.placeholder.com/120x120/333/fff?text=User'
                    }}
                    style={styles.avatar}
                  />
                  <View style={styles.avatarOverlay}>
                    <Ionicons name="camera" size={20} color={theme.colors.text.primary} />
                  </View>
                </TouchableOpacity>
                
                <Text style={styles.userName}>{user ? `${user.firstName} ${user.lastName}` : 'Golf Pro'}</Text>
                <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
                
                <View style={styles.membershipBadge}>
                  <LinearGradient
                    colors={[theme.colors.neon.green, theme.colors.neon.blue]}
                    style={styles.badgeGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.badgeText}>Pro Member</Text>
                  </LinearGradient>
                </View>
              </LinearGradient>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <ProfileStat label="Total Orders" value={profile?.totalOrders?.toString() || '0'} icon="golf" />
              <ProfileStat label="Handicap" value={profile?.golfHandicap?.toString() || 'N/A'} icon="trophy" />
              <ProfileStat label="Referrals" value={referralData?.totalReferrals?.toString() || '0'} icon="people" />
            </View>

            {/* Menu Items */}
            <View style={styles.menuContainer}>
              <MenuItem
                icon="person-circle"
                title="Account Settings"
                subtitle="Edit profile, change password"
                onPress={() => navigation.navigate('AccountSettings')}
              />
              
              <MenuItem
                icon="people"
                title="Referral Program"
                subtitle="Invite friends and earn rewards"
                onPress={() => navigation.navigate('Referrals')}
              />
              
              <MenuItem
                icon="trophy"
                title="Achievements"
                subtitle="View your golf milestones"
                onPress={() => {}}
              />
              
              <MenuItem
                icon="analytics"
                title="Game Statistics"
                subtitle="Track your performance"
                onPress={() => {}}
              />
              
              <MenuItem
                icon="card"
                title="Payment Methods"
                subtitle="Manage cards and billing"
                onPress={() => navigation.navigate('PaymentMethods')}
              />
              
              <MenuItem
                icon="notifications"
                title="Notifications"
                subtitle="Customize your alerts"
                onPress={() => {}}
              />
              
              <MenuItem
                icon="help-circle"
                title="Help & Support"
                subtitle="FAQs and contact support"
                onPress={() => navigation.navigate('HelpSupport')}
              />
              
              <MenuItem
                icon="information-circle"
                title="About"
                subtitle="App version and legal info"
                onPress={() => navigation.navigate('About')}
              />
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LinearGradient
                colors={[theme.colors.error.primary, theme.colors.error.secondary]}
                style={styles.logoutGradient}
              >
                <Ionicons name="log-out" size={20} color={theme.colors.text.primary} />
                <Text style={styles.logoutText}>Logout</Text>
              </LinearGradient>
            </TouchableOpacity>
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
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    textAlign: 'center' as const,
  },
  profileCard: {
    marginBottom: theme.spacing[6],
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden' as const,
  },
  profileGradient: {
    padding: theme.spacing[6],
    alignItems: 'center' as const,
  },
  avatarContainer: {
    position: 'relative' as const,
    marginBottom: theme.spacing[4],
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: theme.colors.neon.green,
  },
  avatarOverlay: {
    position: 'absolute' as const,
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.neon.blue,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 2,
    borderColor: theme.colors.background.primary,
  },
  userName: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  },
  userEmail: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing[4],
  },
  membershipBadge: {
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden' as const,
  },
  badgeGradient: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[2],
  },
  badgeText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  statsContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: theme.spacing[6],
  },
  statCard: {
    flex: 1,
    marginHorizontal: theme.spacing[1],
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden' as const,
  },
  statGradient: {
    padding: theme.spacing[4],
    alignItems: 'center' as const,
  },
  statValue: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing[2],
  },
  statLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[1],
    textAlign: 'center' as const,
  },
  menuContainer: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing[6],
    overflow: 'hidden' as const,
  },
  menuItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: theme.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.primary,
  },
  menuItemLeft: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flex: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background.tertiary,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: theme.spacing[3],
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  menuItemSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing[0.5],
  },
  logoutButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden' as const,
    marginBottom: theme.spacing[4],
  },
  logoutGradient: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    padding: theme.spacing[4],
  },
  logoutText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginLeft: theme.spacing[2],
  },
};