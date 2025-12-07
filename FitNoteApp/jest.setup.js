import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-encrypted-storage', () => ({
  setItem: jest.fn(async () => undefined),
  getItem: jest.fn(async () => null),
  removeItem: jest.fn(async () => undefined),
}));

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');
