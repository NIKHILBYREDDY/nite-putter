import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../lib/theme';
import { Cup, useNiteControlStore } from '../../store/niteControlStore';
import { MultiCupControlScreenProps } from '../../types/navigation';
import { AddCupOptionsModal } from '../../components/ui/AddCupOptionsModal';
import { BleScanModal } from './BleScanModal';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 12;
const CARDS_PER_ROW = 3;
const CARD_WIDTH = (width - (CARD_MARGIN * (CARDS_PER_ROW + 1))) / CARDS_PER_ROW;

interface CupCardProps {
  cup: Cup;
  onPress: () => void;
  onRename: () => void;
  onDelete: () => void;
  onConnect: () => void;
  onDisconnect: () => void;
  onSelect: () => void;
  isSelected: boolean;
}

const CupCard: React.FC<CupCardProps> = ({ 
  cup, 
  onPress, 
  onRename, 
  onDelete,
  onConnect, 
  onDisconnect, 
  onSelect, 
  isSelected 
}) => {
  const [pressingChild, setPressingChild] = useState(false);
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  const glowAnim = React.useRef(new Animated.Value(0.3)).current;
  const childPressBlockUntilRef = React.useRef<number>(0);

  useEffect(() => {
    if (cup.isConnected) {
      // Pulsing animation for connected cups
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
        ]).start(() => pulse());
      };
      pulse();

      // Glowing animation for color circle
      const glow = () => {
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 1500,
            useNativeDriver: false,
          }),
        ]).start(() => glow());
      };
      glow();
    }
  }, [cup.isConnected]);

  return (
    <Animated.View style={[styles.cupCard, { transform: [{ scale: pulseAnim }] }]}>
      <TouchableOpacity
        style={[
          styles.cupCardContent,
          cup.isConnected && styles.cupCardConnected,
          isSelected && styles.cupCardSelected,
        ]}
        onPress={() => {
          if (pressingChild || Date.now() < childPressBlockUntilRef.current) return;
          onPress();
        }}
        activeOpacity={0.8}
      >
        {/* Selection Checkbox and Connection Status */}
        <View style={styles.cupCardHeader}>
          <TouchableOpacity 
            style={[
              styles.selectionCheckbox,
              isSelected && styles.selectionCheckboxSelected
            ]}
            onPressIn={() => setPressingChild(true)}
            onPressOut={() => setPressingChild(false)}
            onPress={() => {
              childPressBlockUntilRef.current = Date.now() + 600;
              onSelect();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {isSelected && (
              <Ionicons name="checkmark" size={14} color={colors.text.primary} />
            )}
          </TouchableOpacity>

          <View style={[
            styles.connectionIndicator,
            { backgroundColor: cup.isConnected ? colors.status.success : colors.background.tertiary }
          ]}>
            <Ionicons
              name={cup.isConnected ? 'wifi' : 'wifi-outline'}
              size={12}
              color={cup.isConnected ? colors.text.primary : colors.text.secondary}
            />
          </View>
          
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity 
              style={styles.renameButton}
              onPressIn={() => setPressingChild(true)}
              onPressOut={() => setPressingChild(false)}
              onPress={() => {
                childPressBlockUntilRef.current = Date.now() + 600;
                onRename();
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="pencil" size={14} color={colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.deleteButton}
              onPressIn={() => setPressingChild(true)}
              onPressOut={() => setPressingChild(false)}
              onPress={() => {
                childPressBlockUntilRef.current = Date.now() + 600;
                onDelete();
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash" size={14} color={colors.status.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Cup Name */}
        <Text style={styles.cupName} numberOfLines={1}>
          {cup.name}
        </Text>

        {/* Glowing Color Circle */}
        <View style={styles.colorContainer}>
          <Animated.View
            style={[
              styles.colorGlow,
              {
                backgroundColor: cup.color,
                opacity: glowAnim,
                shadowColor: cup.color,
              },
            ]}
          />
          <View
            style={[
              styles.colorCircle,
              { backgroundColor: cup.color },
            ]}
          />
        </View>

        {/* Battery Level */}
        <View style={styles.batteryContainer}>
          <Ionicons
            name="battery-half"
            size={14}
            color={colors.text.secondary}
          />
          <Text style={styles.batteryText}>{cup.batteryLevel}%</Text>
        </View>

        {/* Connect/Disconnect Buttons */}
        <View style={styles.connectionButtons}>
          {cup.isConnected ? (
            <TouchableOpacity
              style={[styles.connectionButton, styles.disconnectButton]}
              onPressIn={() => setPressingChild(true)}
              onPressOut={() => setPressingChild(false)}
              onPress={() => {
                childPressBlockUntilRef.current = Date.now() + 600;
                onDisconnect();
              }}
              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            >
              <Ionicons name="close-circle" size={12} color={colors.text.primary} />
              <Text style={styles.connectionButtonText}>Disconnect</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.connectionButton, styles.connectButton]}
              onPressIn={() => setPressingChild(true)}
              onPressOut={() => setPressingChild(false)}
              onPress={() => {
                childPressBlockUntilRef.current = Date.now() + 600;
                onConnect();
              }}
              hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
            >
              <Ionicons name="wifi" size={12} color={colors.text.primary} />
              <Text style={styles.connectionButtonText}>Connect</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tap to Customize Hint */}
        <Text style={styles.tapHint}>Tap to customize</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const MultiCupControlScreen: React.FC<MultiCupControlScreenProps> = ({ navigation }) => {
  const {
    cups,
    connectToCup,
    disconnectFromCup,
    removeCup,
    renameCup,
  } = useNiteControlStore();
  
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [selectedCupForRename, setSelectedCupForRename] = useState<Cup | null>(null);
  const [newCupName, setNewCupName] = useState('');
  const [isConnectingAll, setIsConnectingAll] = useState(false);
  const [connectProgress, setConnectProgress] = useState(0);
  const connectPulse = React.useRef(new Animated.Value(1)).current;
  const connectLoopRef = React.useRef<Animated.CompositeAnimation | null>(null);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showBleModal, setShowBleModal] = useState(false);
  
  // Selection state
  const [selectedCupIds, setSelectedCupIds] = useState<Set<string>>(new Set());

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (isConnectingAll) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(connectPulse, {
            toValue: 1.08,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(connectPulse, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      connectLoopRef.current = loop;
      loop.start();
    } else {
      connectLoopRef.current?.stop();
      connectPulse.stopAnimation();
    }
    return () => {
      connectLoopRef.current?.stop();
    };
  }, [isConnectingAll, connectPulse]);

  // Cups are sourced from global store

  const connectedCups = cups.filter(cup => cup.isConnected);

  const handleCupPress = (cup: Cup) => {
    if (!cup.isConnected) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        'Cup Not Connected',
        `${cup.name} is not connected. Please connect the cup first to customize its color.`,
        [{ text: 'OK' }]
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    // Navigate to ColorWheel screen
    navigation.navigate('ColorWheel', {
      cupId: cup.id,
      cupName: cup.name,
      currentColor: cup.color,
    });
  };

  const handleRename = (cup: Cup) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCupForRename(cup);
    setNewCupName(cup.name);
    setShowRenameModal(true);
  };

  const handleSaveRename = () => {
    if (newCupName.trim() && selectedCupForRename) {
      renameCup(selectedCupForRename.id, newCupName.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowRenameModal(false);
      setSelectedCupForRename(null);
      setNewCupName('');
    }
  };

  const handleCancelRename = () => {
    setShowRenameModal(false);
    setSelectedCupForRename(null);
    setNewCupName('');
  };

  // Selection handlers
  const handleCupSelect = (cupId: string) => {
    setSelectedCupIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cupId)) {
        newSet.delete(cupId);
      } else {
        newSet.add(cupId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedCupIds.size === cups.length) {
      setSelectedCupIds(new Set());
    } else {
      setSelectedCupIds(new Set(cups.map(cup => cup.id)));
    }
  };

  // Connection handlers
  const handleConnect = async (cupId: string) => {
    await connectToCup(cupId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDisconnect = async (cupId: string) => {
    await disconnectFromCup(cupId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Bulk action handlers
  const handleConnectAll = async () => {
    if (isConnectingAll) return;
    setIsConnectingAll(true);
    setConnectProgress(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const total = cups.length;
      for (let i = 0; i < total; i++) {
        const cupToConnect = cups[i];
        if (!cupToConnect) {
          continue;
        }
        await connectToCup(cupToConnect.id);
        setConnectProgress(Math.round(((i + 1) / total) * 100));
      }
    } catch (e) {
      console.warn('Connect-all encountered an error', e);
    }

    setIsConnectingAll(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDisconnectAll = async () => {
    for (const cup of cups) {
      await disconnectFromCup(cup.id);
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const handleBulkConnect = async () => {
    const selectedIds = Array.from(selectedCupIds);
    for (const id of selectedIds) {
      await connectToCup(id);
    }
    setSelectedCupIds(new Set());
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleBulkDisconnect = async () => {
    const selectedIds = Array.from(selectedCupIds);
    for (const id of selectedIds) {
      await disconnectFromCup(id);
    }
    setSelectedCupIds(new Set());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const handleDelete = (cupId: string) => {
    Alert.alert(
      'Remove Cup',
      'Are you sure you want to remove this cup?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeCup(cupId);
            setSelectedCupIds(prev => {
              const next = new Set(prev);
              next.delete(cupId);
              return next;
            });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleBulkDelete = () => {
    const selectedIds = Array.from(selectedCupIds);
    if (selectedIds.length === 0) return;
    Alert.alert(
      'Remove Selected Cups',
      `Remove ${selectedIds.length} selected cup${selectedIds.length !== 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            selectedIds.forEach(id => removeCup(id));
            setSelectedCupIds(new Set());
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const renderCupCard = ({ item }: { item: Cup }) => (
    <CupCard
      cup={item}
      onPress={() => handleCupPress(item)}
      onRename={() => handleRename(item)}
      onDelete={() => handleDelete(item.id)}
      onConnect={() => handleConnect(item.id)}
      onDisconnect={() => handleDisconnect(item.id)}
      onSelect={() => handleCupSelect(item.id)}
      isSelected={selectedCupIds.has(item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
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
              <TouchableOpacity
                style={styles.headerAddButton}
                onPress={() => {
                  if (cups.length >= 18) {
                    Alert.alert('Maximum Reached', 'You can have up to 18 cups.');
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    return;
                  }
                  setShowAddOptions(true);
                }}
              >
                <Ionicons name="add" size={20} color={colors.text.primary} />
              </TouchableOpacity>
              <Text style={styles.title}>Multi-Cup Control</Text>
              <Text style={styles.subtitle}>
                {connectedCups.length} of {cups.length} cups connected
              </Text>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: colors.status.success + '20' }]}>
                  <Ionicons name="wifi" size={20} color={colors.status.success} />
                </View>
                <Text style={styles.statNumber}>{connectedCups.length}</Text>
                <Text style={styles.statLabel}>Connected</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: colors.neon.blue + '20' }]}>
                  <Ionicons name="golf" size={20} color={colors.neon.blue} />
                </View>
                <Text style={styles.statNumber}>{cups.length}</Text>
                <Text style={styles.statLabel}>Total Cups</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: colors.neon.purple + '20' }]}>
                  <Ionicons name="battery-half" size={20} color={colors.neon.purple} />
                </View>
                <Text style={styles.statNumber}>
                  {Math.round(cups.reduce((acc, cup) => acc + cup.batteryLevel, 0) / cups.length)}%
                </Text>
                <Text style={styles.statLabel}>Avg Battery</Text>
              </View>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsContainer}>
              <View style={styles.instructionItem}>
                <Ionicons name="finger-print" size={16} color={colors.neon.blue} />
                <Text style={styles.instructionText}>Tap a cup to customize its color</Text>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="pencil" size={16} color={colors.neon.green} />
                <Text style={styles.instructionText}>Tap the pencil icon to rename</Text>
              </View>
            </View>

            {/* Bulk Action Controls */}
            <View style={styles.bulkActionsContainer}>
              <View style={styles.bulkActionsHeader}>
                <Text style={styles.bulkActionsTitle}>Bulk Actions</Text>
                <TouchableOpacity
                  style={styles.selectAllButton}
                  onPress={() => {
                    handleSelectAll();
                  }}
                >
                  <Ionicons 
                    name={selectedCupIds.size === cups.length ? "checkbox" : "square-outline"} 
                    size={16} 
                    color={colors.neon.blue} 
                  />
                  <Text style={styles.selectAllText}>
                    {selectedCupIds.size === cups.length ? "Deselect All" : "Select All"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.bulkActionsRow}>
                {/* Global Actions */}
                <TouchableOpacity
                  style={[styles.bulkActionButton, styles.connectAllButton, isConnectingAll && { opacity: 0.6 }]}
                  onPress={handleConnectAll}
                  disabled={isConnectingAll}
                >
                  <Ionicons name="bluetooth" size={16} color={colors.text.primary} />
                  <Text style={styles.bulkActionButtonText}>{isConnectingAll ? 'Connecting…' : 'Connect All'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.bulkActionButton, styles.disconnectAllButton]}
                  onPress={handleDisconnectAll}
                >
                  <Ionicons name="wifi-outline" size={16} color={colors.text.primary} />
                  <Text style={styles.bulkActionButtonText}>Disconnect All</Text>
                </TouchableOpacity>
              </View>

              {/* Selected Actions */}
              {selectedCupIds.size > 0 && (
                <View style={styles.selectedActionsContainer}>
                  <Text style={styles.selectedCountText}>
                    {selectedCupIds.size} cup{selectedCupIds.size !== 1 ? 's' : ''} selected
                  </Text>
                  <View style={styles.selectedActionsRow}>
                    <TouchableOpacity
                      style={[styles.selectedActionButton, styles.selectedConnectButton]}
                      onPress={handleBulkConnect}
                    >
                      <Ionicons name="wifi" size={14} color={colors.text.primary} />
                      <Text style={styles.selectedActionButtonText}>Connect</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.selectedActionButton, styles.selectedDisconnectButton]}
                      onPress={handleBulkDisconnect}
                    >
                      <Ionicons name="close-circle" size={14} color={colors.text.primary} />
                      <Text style={styles.selectedActionButtonText}>Disconnect</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.selectedActionButton, styles.selectedDeleteButton]}
                      onPress={handleBulkDelete}
                    >
                      <Ionicons name="trash" size={14} color={colors.text.primary} />
                      <Text style={styles.selectedActionButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* Cups Grid */}
            <View style={styles.cupsSection}>
              <Text style={styles.sectionTitle}>Your Cups</Text>
              <FlatList
                data={cups}
                renderItem={renderCupCard}
                keyExtractor={(item) => item.id}
                numColumns={CARDS_PER_ROW}
                scrollEnabled={false}
                contentContainerStyle={styles.cupsGrid}
                columnWrapperStyle={styles.cupsRow}
                extraData={selectedCupIds}
                ItemSeparatorComponent={() => <View style={{ height: CARD_MARGIN }} />}
              />
            </View>
          </Animated.View>
        </ScrollView>

        {isConnectingAll && (
          <View style={styles.connectingOverlay} pointerEvents="auto">
            <View style={styles.connectingCard}>
              <Animated.View style={{ transform: [{ scale: connectPulse }] }}>
                <Ionicons name="bluetooth" size={36} color={colors.neon.blue} />
              </Animated.View>
              <Text style={styles.connectingTitle}>Connecting cups…</Text>
              <Text style={styles.connectingSubtitle}>{connectProgress}% completed</Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressBar, { width: `${connectProgress}%` }]} />
              </View>
            </View>
          </View>
        )}
      
        {/* Rename Modal */}
        <Modal
          visible={showRenameModal}
          transparent
          animationType="fade"
          onRequestClose={handleCancelRename}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Rename Cup</Text>
              <Text style={styles.modalSubtitle}>
                Enter a new name for {selectedCupForRename?.name}
              </Text>
              
              <TextInput
                style={styles.modalInput}
                value={newCupName}
                onChangeText={setNewCupName}
                placeholder="Enter cup name"
                placeholderTextColor={colors.text.secondary}
                maxLength={20}
                autoFocus
                selectTextOnFocus
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={handleCancelRename}
                >
                  <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.modalButtonSave]}
                  onPress={handleSaveRename}
                  disabled={!newCupName.trim()}
                >
                  <Text style={[
                    styles.modalButtonTextSave,
                    !newCupName.trim() && styles.modalButtonTextDisabled
                  ]}>
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </LinearGradient>
      {/* Add Device Options */}
      <AddCupOptionsModal
        visible={showAddOptions}
        onClose={() => setShowAddOptions(false)}
        onScanQr={() => {
          setShowAddOptions(false);
          navigation.navigate('QrScan');
        }}
        onBluetoothScan={() => {
          setShowAddOptions(false);
          setShowBleModal(true);
        }}
      />
      {/* BLE Scan Modal */}
      <BleScanModal visible={showBleModal} onClose={() => setShowBleModal(false)} />
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  headerAddButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    transform: [{ translateY: -6 }],
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.secondary,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.secondary,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  instructionsContainer: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border.secondary,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginLeft: 12,
    flex: 1,
  },
  cupsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
  },
  cupsGrid: {
    paddingBottom: 20,
  },
  cupsRow: {
    justifyContent: 'space-between',
    marginBottom: CARD_MARGIN,
  },
  cupCard: {
    width: CARD_WIDTH,
  },
  cupCardContent: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border.secondary,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  cupCardConnected: {
    borderColor: colors.neon.blue + '40',
    backgroundColor: colors.background.tertiary + 'E0',
  },
  cupCardSelected: {
    borderColor: colors.neon.purple + '60',
    backgroundColor: colors.background.tertiary + 'F0',
  },
  cupCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectionCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  selectionCheckboxSelected: {
    borderColor: colors.neon.purple,
    backgroundColor: colors.neon.purple,
  },
  connectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  renameButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  cupName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  colorContainer: {
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  colorGlow: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 10,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.text.primary,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  batteryText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  connectionButtons: {
    marginBottom: 8,
  },
  connectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 4,
  },
  connectButton: {
    backgroundColor: colors.status.success + '20',
    borderWidth: 1,
    borderColor: colors.status.success + '40',
  },
  disconnectButton: {
    backgroundColor: colors.status.error + '20',
    borderWidth: 1,
    borderColor: colors.status.error + '40',
  },
  connectionButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text.primary,
  },
  tapHint: {
    fontSize: 10,
    color: colors.neon.blue,
    textAlign: 'center',
    fontWeight: '500',
    opacity: 0.8,
  },

  // Bulk Actions Styles
  bulkActionsContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border.secondary,
  },
  bulkActionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bulkActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: colors.background.tertiary,
  },
  selectAllText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.neon.blue,
  },
  bulkActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  bulkActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  connectAllButton: {
    backgroundColor: colors.status.success + '20',
    borderWidth: 1,
    borderColor: colors.status.success + '40',
  },
  disconnectAllButton: {
    backgroundColor: colors.status.error + '20',
    borderWidth: 1,
    borderColor: colors.status.error + '40',
  },
  bulkActionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
  },
  selectedActionsContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border.secondary,
  },
  selectedCountText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  selectedActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  selectedActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
  },
  selectedConnectButton: {
    backgroundColor: colors.neon.blue + '20',
    borderWidth: 1,
    borderColor: colors.neon.blue + '40',
  },
  selectedDisconnectButton: {
    backgroundColor: colors.neon.purple + '20',
    borderWidth: 1,
    borderColor: colors.neon.purple + '40',
  },
  selectedDeleteButton: {
    backgroundColor: colors.status.error + '20',
    borderWidth: 1,
    borderColor: colors.status.error + '40',
  },
  selectedActionButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text.primary,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: colors.background.tertiary,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: colors.border.secondary,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border.secondary,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.secondary,
  },
  modalButtonSave: {
    backgroundColor: colors.neon.blue,
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  modalButtonTextSave: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  modalButtonTextDisabled: {
    opacity: 0.5,
  },
  connectingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  connectingCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.background.tertiary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.secondary,
    padding: 16,
    alignItems: 'center',
  },
  connectingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: 10,
  },
  connectingSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
    marginBottom: 12,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    borderRadius: 6,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.secondary,
    overflow: 'hidden',
  },
  progressBar: {
    height: 8,
    borderRadius: 6,
    backgroundColor: colors.neon.blue,
  },
});