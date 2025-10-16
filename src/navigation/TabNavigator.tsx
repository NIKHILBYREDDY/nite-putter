import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { HomeScreen } from '../features/home/HomeScreen';
import { ShopScreen } from '../features/shop/ShopScreen';
import { ProductDetailScreen } from '../features/shop/ProductDetailScreen';
import { CartScreen } from '../features/shop/CartScreen';
import { CheckoutScreen } from '../features/shop/CheckoutScreen';
import { NiteControlScreen } from '../features/niteControl/NiteControlScreen';
import { MultiCupControlScreen } from '../features/niteControl/MultiCupControlScreen';
import { ColorWheelScreen } from '../features/niteControl/ColorWheelScreen';
import QrScanScreen from '../features/niteControl/QrScanScreen';
import { ProfileScreen } from '../features/profile/ProfileScreen';
import { ReferralsScreen } from '../features/profile/ReferralsScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { AccountSettingsScreen } from '../features/settings/AccountSettingsScreen';
import { PaymentMethodsScreen } from '../features/settings/PaymentMethodsScreen';
import { AboutScreen } from '../features/about/AboutScreen';
import { HelpSupportScreen } from '../features/support/HelpSupportScreen';
import { Body } from '../components/ui/Typography';
import { theme } from '../lib/theme';
import { TabParamList, ShopStackParamList, NiteControlStackParamList, ProfileStackParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<TabParamList>();
const ShopStack = createStackNavigator<ShopStackParamList>();
const NiteControlStack = createStackNavigator<NiteControlStackParamList>();
const ProfileStackNavigator = createStackNavigator<ProfileStackParamList>();

interface TabIconProps {
  focused: boolean;
  icon: string;
}

const TabIcon: React.FC<TabIconProps> = ({ focused, icon }) => (
  <View style={[styles.tabIcon, focused ? styles.tabIconFocused : {}]}>
    <Body style={[styles.tabIconText, focused ? styles.tabIconTextFocused : {}]}>
      {icon}
    </Body>
    {focused && <View style={styles.tabIndicator} />}
  </View>
);

// Shop Stack Navigator
const ShopStackComponent = () => {
  return (
    <ShopStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0A0A0A' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <ShopStack.Screen 
        name="ShopMain" 
        component={ShopScreen} 
        options={{ title: 'Shop' }}
      />
      <ShopStack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen} 
        options={{ title: 'Product Details' }}
      />
      <ShopStack.Screen 
        name="Cart" 
        component={CartScreen} 
        options={{ title: 'Shopping Cart' }}
      />
      <ShopStack.Screen 
        name="Checkout" 
        component={CheckoutScreen} 
        options={{ title: 'Checkout' }}
      />
    </ShopStack.Navigator>
  );
};

// NiteControl Stack Navigator
const NiteControlStackComponent = () => {
  return (
    <NiteControlStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0A0A0A' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <NiteControlStack.Screen 
        name="NiteControlMain" 
        component={NiteControlScreen} 
        options={{ title: 'Nite Control' }}
      />
      <NiteControlStack.Screen 
        name="MultiCupControl" 
        component={MultiCupControlScreen} 
        options={{ title: 'Multi-Cup Control' }}
      />
      <NiteControlStack.Screen 
        name="ColorWheel" 
        component={ColorWheelScreen} 
        options={{ headerShown: false }}
      />
      <NiteControlStack.Screen 
        name="QrScan" 
        component={QrScanScreen} 
        options={{ headerShown: false }}
      />
    </NiteControlStack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStack = () => {
  return (
    <ProfileStackNavigator.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#0A0A0A' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <ProfileStackNavigator.Screen 
        name="ProfileMain" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }}
      />
      <ProfileStackNavigator.Screen 
        name="Referrals" 
        component={ReferralsScreen} 
        options={{ title: 'Referral Program' }}
      />
      <ProfileStackNavigator.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'Settings' }}
      />
      <ProfileStackNavigator.Screen 
        name="AccountSettings" 
        component={AccountSettingsScreen} 
        options={{ title: 'Account Settings' }}
      />
      <ProfileStackNavigator.Screen 
        name="PaymentMethods" 
        component={PaymentMethodsScreen} 
        options={{ title: 'Payment Methods' }}
      />
      <ProfileStackNavigator.Screen 
        name="About" 
        component={AboutScreen} 
        options={{ title: 'About' }}
      />
      <ProfileStackNavigator.Screen 
        name="HelpSupport" 
        component={HelpSupportScreen} 
        options={{ title: 'Help & Support' }}
      />
    </ProfileStackNavigator.Navigator>
  );
};

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarBackground: () => (
          <LinearGradient
            colors={[
              theme.colors.background.secondary + 'E6',
              theme.colors.background.primary + 'E6',
            ]}
            style={styles.tabBarGradient}
          />
        ),
        tabBarActiveTintColor: theme.colors.neon.blue,
        tabBarInactiveTintColor: theme.colors.text.tertiary,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="🏠" />
          ),
        }}
      />
      <Tab.Screen
        name="Shop"
        component={ShopStackComponent}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="🛒" />
          ),
        }}
      />
      <Tab.Screen
        name="NiteControl"
        component={NiteControlStackComponent}
        options={{
          title: 'Control',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="🎮" />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="👤" />
          ),
        }}
      />

    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 85,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.primary,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabBarGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 8,
  },
  tabBarItem: {
    paddingTop: 8,
  },
  tabIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 16,
    position: 'relative',
  },
  tabIconFocused: {
    backgroundColor: theme.colors.neon.blue + '20',
    borderWidth: 1,
    borderColor: theme.colors.neon.blue + '40',
  },
  tabIconText: {
    fontSize: 18,
  },
  tabIconTextFocused: {
    transform: [{ scale: 1.1 }],
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.neon.blue,
  },
});