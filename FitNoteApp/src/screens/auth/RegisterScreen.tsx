import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAuth } from '../../hooks/useAuth';
import type { AuthStackParamList } from '../../navigations/types';
import type { UnitSystem } from '../../services/authApi';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const unitSystemOptions: Array<{ label: string; value: UnitSystem }> = [
  { label: '킬로그램 (KG)', value: 'KG' },
  { label: '파운드 (LB)', value: 'LB' },
];

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('KG');
  const [timezone, setTimezone] = useState('Asia/Seoul');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEmailValid = useMemo(() => /\S+@\S+\.\S+/.test(email.trim()), [email]);
  const isPasswordValid = useMemo(() => password.trim().length >= 8, [password]);
  const hasAllFields = useMemo(
    () => Boolean(email && password && confirmPassword && displayName),
    [confirmPassword, displayName, email, password],
  );
  const isFormValid =
    hasAllFields && isEmailValid && isPasswordValid && password === confirmPassword;

  const handleSubmit = async () => {
    if (!hasAllFields) {
      setError('모든 필드를 입력해 주세요.');
      return;
    }
    if (!isEmailValid) {
      setError('올바른 이메일 형식을 입력해 주세요.');
      return;
    }
    if (!isPasswordValid) {
      setError('비밀번호는 8자 이상 입력해 주세요.');
      return;
    }
    if (password !== confirmPassword) {
      setError('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await register({
        email: email.trim(),
        password: password.trim(),
        displayName,
        unitSystem,
        timezone,
      });
      Alert.alert('회원가입 성공', '이메일과 비밀번호로 로그인해 주세요.', [
        {
          text: '확인',
          onPress: () => navigation.navigate('Login'),
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>FitNote 계정을 만들어보세요</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>이메일</Text>
          <TextInput
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setError(null);
            }}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
            editable={!isSubmitting}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>닉네임</Text>
          <TextInput
            value={displayName}
            onChangeText={(text) => {
              setDisplayName(text);
              setError(null);
            }}
            placeholder="닉네임"
            style={styles.input}
            editable={!isSubmitting}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setError(null);
            }}
            placeholder="8자 이상 비밀번호"
            secureTextEntry
            autoCapitalize="none"
            style={styles.input}
            editable={!isSubmitting}
            onSubmitEditing={handleSubmit}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>비밀번호 확인</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setError(null);
            }}
            placeholder="비밀번호 재입력"
            secureTextEntry
            autoCapitalize="none"
            style={styles.input}
            editable={!isSubmitting}
            onSubmitEditing={handleSubmit}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>단위 시스템</Text>
          <View style={styles.unitContainer}>
            {unitSystemOptions.map((option) => (
              <Pressable
                key={option.value}
                style={({ pressed }) => [
                  styles.unitButton,
                  unitSystem === option.value && styles.unitButtonSelected,
                  pressed && styles.unitButtonPressed,
                ]}
                onPress={() => setUnitSystem(option.value)}
                disabled={isSubmitting}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    unitSystem === option.value && styles.unitButtonTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>시간대</Text>
          <TextInput
            value={timezone}
            onChangeText={(text) => {
              setTimezone(text);
              setError(null);
            }}
            placeholder="Asia/Seoul"
            autoCapitalize="none"
            style={styles.input}
            editable={!isSubmitting}
          />
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            (!isFormValid || isSubmitting) && styles.submitButtonDisabled,
            pressed && styles.submitButtonPressed,
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting || !isFormValid}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitButtonText}>회원가입</Text>
          )}
        </Pressable>
        <Pressable style={styles.backToLoginButton} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.backToLoginText}>이미 계정이 있으신가요? 로그인</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 24,
    color: '#111827',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 14, android: 10, default: 12 }),
    fontSize: 16,
    color: '#111827',
  },
  unitContainer: {
    flexDirection: 'row',
    columnGap: 12,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitButtonSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#dbeafe',
  },
  unitButtonPressed: {
    opacity: 0.85,
  },
  unitButtonText: {
    color: '#4b5563',
    fontWeight: '500',
  },
  unitButtonTextSelected: {
    color: '#1d4ed8',
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 16,
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonPressed: {
    opacity: 0.85,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  backToLoginButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  backToLoginText: {
    color: '#2563eb',
    fontWeight: '600',
  },
  errorText: {
    color: '#dc2626',
    marginBottom: 12,
  },
});