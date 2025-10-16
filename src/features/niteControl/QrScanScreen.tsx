import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNiteControlStore } from '../../store/niteControlStore';
import { theme } from '../../lib/theme';
import type { NiteControlStackScreenProps } from '../../types/navigation';
import { BarCodeScanner } from 'expo-barcode-scanner';

type Props = NiteControlStackScreenProps<'QrScan'>;

// Frontend-only placeholder QR scanning screen.
// Provides a manual code entry and simple instructions.
export default function QrScanScreen({ navigation }: Props) {
  const { addCup } = useNiteControlStore();
  const [code, setCode] = useState('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      if (mounted) setHasPermission(status === 'granted');
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleBarCodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    const id = data?.trim() || `qr-${Date.now()}`;
    addCup({ id, name: `Cup ${id.slice(-4)}`, isConnected: false });
    navigation.navigate('NiteControlMain');
  };

  const onAdd = () => {
    const id = code.trim() || `qr-${Date.now()}`;
    addCup({ id, name: `Cup ${id.slice(-4)}`, isConnected: false });
    navigation.navigate('NiteControlMain');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.title}>Add Accessory</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      {hasPermission === null && (
        <View style={styles.permissionBox}>
          <Text style={styles.permissionText}>Requesting camera permission…</Text>
        </View>
      )}

      {hasPermission === false && (
        <View style={styles.permissionBox}>
          <Text style={styles.permissionText}>Camera access is required to scan a QR code.</Text>
          <TouchableOpacity
            onPress={async () => {
              const { status } = await BarCodeScanner.requestPermissionsAsync();
              setHasPermission(status === 'granted');
            }}
            style={styles.permissionBtn}
          >
            <Text style={styles.permissionBtnText}>Enable Camera</Text>
          </TouchableOpacity>
        </View>
      )}

      {hasPermission && (
        <View style={styles.scannerContainer}>
          <BarCodeScanner
            onBarCodeScanned={handleBarCodeScanned}
            style={styles.scanner}
          />
        </View>
      )}

      {!hasPermission && (
        <View style={styles.cameraStub}>
          <Ionicons name="qr-code" size={88} color={theme.colors.text.secondary} />
        </View>
      )}

      <Text style={styles.subtitle}>Scan a Setup Code or Enter Manually</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter setup code"
        value={code}
        onChangeText={setCode}
        placeholderTextColor={theme.colors.text.secondary}
      />

      <TouchableOpacity onPress={onAdd} style={styles.addBtn}>
        <Text style={styles.addBtnText}>Add Cup</Text>
      </TouchableOpacity>

      <View style={styles.moreOptions}>
        <Text style={styles.moreOptionsText}>More options…</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  closeBtn: {
    position: 'absolute',
    right: 0,
    padding: 8,
  },
  scannerContainer: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border.secondary,
    marginTop: 24,
    marginBottom: 16,
    backgroundColor: theme.colors.background.secondary,
  },
  scanner: {
    flex: 1,
  },
  cameraStub: {
    height: 180,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 16,
    backgroundColor: theme.colors.background.secondary,
  },
  subtitle: {
    textAlign: 'center',
    color: theme.colors.text.secondary,
    marginBottom: 12,
  },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border.secondary,
    paddingHorizontal: 12,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.secondary,
  },
  addBtn: {
    marginTop: 16,
    backgroundColor: theme.colors.neon.blue,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  permissionBox: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border.secondary,
    backgroundColor: theme.colors.background.secondary,
    padding: 14,
    marginTop: 24,
  },
  permissionText: {
    color: theme.colors.text.secondary,
  },
  permissionBtn: {
    marginTop: 12,
    backgroundColor: theme.colors.neon.blue,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  permissionBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  moreOptions: {
    marginTop: 12,
    alignItems: 'center',
  },
  moreOptionsText: {
    color: theme.colors.text.secondary,
  },
});