import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNiteControlStore } from '../../store/niteControlStore';
import { theme } from '../../lib/theme';
import type { NiteControlStackScreenProps } from '../../types/navigation';

type Props = NiteControlStackScreenProps<'QrScan'>;

// Frontend-only placeholder QR scanning screen.
// Provides a manual code entry and simple instructions.
export default function QrScanScreen({ navigation }: Props) {
  const { addCup } = useNiteControlStore();
  const [code, setCode] = useState('');

  const onAdd = () => {
    const id = code.trim() || `qr-${Date.now()}`;
    addCup({ id, name: `Cup ${id.slice(-4)}`, isConnected: false });
    navigation.navigate('NiteControlMain');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Accessory</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.cameraStub}>
        <Ionicons name="qr-code" size={88} color={theme.colors.text.secondary} />
      </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    paddingHorizontal: 16,
    paddingTop: 16,
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
});