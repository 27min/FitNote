import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  createRoutine,
  deleteRoutine,
  fetchRoutines,
  type RoutineItem,
  type RoutinePayload,
} from '../services/routineApi';

export function useRoutineData() {
  const [items, setItems] = useState<RoutineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const resolveError = useCallback((e: unknown) => {
    if (e instanceof Error) return e.message;
    return '알 수 없는 오류가 발생했습니다.';
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRoutines();
      setItems(data);
    } catch (e) {
      setError(resolveError(e));
    } finally {
      setLoading(false);
    }
  }, [resolveError]);

  useEffect(() => {
    load();
  }, [load]);

  const addRoutine = useCallback(async (payload: RoutinePayload) => {
    setSaving(true);
    try {
      await createRoutine(payload);
      await load();
    } catch (e) {
      setError(resolveError(e));
    } finally {
      setSaving(false);
    }
  }, [load, resolveError]);

  const removeRoutine = useCallback(async (id: number) => {
    try {
      await deleteRoutine(id);
      await load();
    } catch (e) {
      setError(resolveError(e));
    }
  }, [load, resolveError]);

  return { items, loading, error, saving, refresh: load, addRoutine, removeRoutine };
}

function RoutineCard({ item, onDelete }: { item: RoutineItem; onDelete: (id: number) => void }) {
  const subtitle = useMemo(() => item.description || '설명이 없습니다.', [item.description]);
  return (
    <View style={cardStyles.card}>
      <Text style={cardStyles.title}>{item.name}</Text>
      <Text style={cardStyles.subtitle}>{subtitle}</Text>
      <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => onDelete(item.id)}>
        <Text style={[styles.buttonLabel, styles.buttonLabelDark]}>삭제</Text>
      </TouchableOpacity>
    </View>
  );
}

function NewRoutineModal({
  visible,
  saving,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  saving: boolean;
  onClose: () => void;
  onSubmit: (payload: RoutinePayload) => Promise<void>;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) return;
    await onSubmit({ name: name.trim(), description });
    setName('');
    setDescription('');
    onClose();
  }, [name, description, onClose, onSubmit]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>새 루틴 추가</Text>
          <TextInput placeholder="루틴 이름" value={name} onChangeText={setName} style={styles.input} />
          <TextInput
            placeholder="설명"
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.inputMultiline]}
            multiline
          />
          <View style={styles.row}>
            <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={onClose}>
              <Text style={[styles.buttonLabel, styles.buttonLabelDark]}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={handleSubmit}
              disabled={saving}
              testID="save-routine"
            >
              <Text style={styles.buttonLabel}>{saving ? '저장 중...' : '저장'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function RoutineScreen() {
  const { items, loading, error, saving, refresh, addRoutine, removeRoutine } = useRoutineData();
  const [showModal, setShowModal] = useState(false);

  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator />
          <Text style={styles.caption}>루틴을 불러오는 중입니다...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={refresh}>
            <Text style={styles.buttonLabel}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!items.length) {
      return (
        <View style={styles.centered}>
          <Text style={styles.caption}>등록된 루틴이 없습니다.</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <RoutineCard item={item} onDelete={removeRoutine} />}
        contentContainerStyle={styles.listContent}
      />
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>루틴 관리</Text>
        <TouchableOpacity style={[styles.button, styles.buttonPrimary]} onPress={openModal} testID="open-routine-modal">
          <Text style={styles.buttonLabel}>새 루틴</Text>
        </TouchableOpacity>
      </View>
      {renderContent()}
      <NewRoutineModal visible={showModal} saving={saving} onClose={closeModal} onSubmit={addRoutine} />
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  subtitle: { color: '#666', marginBottom: 8 },
});

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f4f6f8' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700' },
  caption: { color: '#666', marginTop: 8 },
  listContent: { paddingBottom: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', gap: 8, marginTop: 12 },
  button: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  buttonPrimary: { backgroundColor: '#2563eb' },
  buttonSecondary: { backgroundColor: '#e5e7eb' },
  buttonLabel: { color: '#fff', fontWeight: '600' },
  buttonLabelDark: { color: '#111827' },
  errorText: { color: '#dc2626', marginBottom: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
});
