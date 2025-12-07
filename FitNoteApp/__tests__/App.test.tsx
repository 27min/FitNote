/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('react-native-vector-icons/Ionicons', () => 'Ionicons');
jest.mock('../src/navigations/RootNavigator', () => () => null);

test('renders correctly', async () => {
  await ReactTestRenderer.act(async () => {
    const tree = ReactTestRenderer.create(<App />);
    await Promise.resolve();
    expect(tree).toBeDefined();
  });
});
