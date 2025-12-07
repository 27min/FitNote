import React, { useEffect } from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';

import { useHistoryData } from '../src/screens/HistoryScreen';
import { createHistory, fetchHistory } from '../src/services/historyApi';

jest.mock('../src/services/historyApi');

const mockedFetchHistory = fetchHistory as jest.MockedFunction<typeof fetchHistory>;
const mockedCreateHistory = createHistory as jest.MockedFunction<typeof createHistory>;

function HistoryHookProbe({ onChange }: { onChange: (value: ReturnType<typeof useHistoryData>) => void }) {
  const value = useHistoryData();
  useEffect(() => {
    onChange(value);
  }, [onChange, value]);
  return null;
}

const flushPromises = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};

describe('History integration', () => {
  it('refreshes history after adding a new session', async () => {
    mockedFetchHistory.mockResolvedValueOnce([]);
    mockedCreateHistory.mockResolvedValue({ id: 1, title: '새 세션', startedAt: '2024-01-01T00:00:00.000Z' });
    mockedFetchHistory.mockResolvedValueOnce([
      { id: 1, title: '새 세션', startedAt: '2024-01-01T00:00:00.000Z' },
    ]);

    let latestValue: ReturnType<typeof useHistoryData> | undefined;
    const onChange = jest.fn((value: ReturnType<typeof useHistoryData>) => {
      latestValue = value;
    });

    await act(async () => {
      ReactTestRenderer.create(<HistoryHookProbe onChange={onChange} />);
    });
    await flushPromises();

    expect(mockedFetchHistory).toHaveBeenCalledTimes(1);
    await act(async () => {
      await latestValue?.addSession({ title: '새 세션', startedAt: '2024-01-01T00:00:00.000Z' });
    });
    await flushPromises();

    expect(mockedFetchHistory).toHaveBeenCalledTimes(2);
    expect(latestValue?.items).toHaveLength(1);
    expect(latestValue?.items?.[0]?.title).toBe('새 세션');
  });
});
