import { dispatchWorkflow, saveDispatchHistory, clearDispatchHistory } from '../src/workflow';
import { Status } from '../src/types';

describe('workflow', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  test('dispatchWorkflow calls fetch with correct arguments', async () => {
    const mockResponse = { ok: true } as Response;
    const mockFetch = jest.fn().mockResolvedValue(mockResponse);
    (global as any).fetch = mockFetch;
    await dispatchWorkflow('owner', 'repo', 'flow.yml', 'main', 'token', { foo: 'bar' });
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/owner/repo/actions/workflows/flow.yml/dispatches',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'token token',
          Accept: 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({ ref: 'main', inputs: { foo: 'bar' } }),
      }
    );
  });

  test('saveDispatchHistory and clearDispatchHistory manage localStorage', () => {
    const entry = {
      owner: 'o',
      repo: 'r',
      workflow: 'wf',
      ref: 'main',
      payload: {},
      timestamp: '2024-01-01T00:00:00Z',
      status: Status.Success,
      errorMessage: null,
    };
    saveDispatchHistory(entry);
    const stored = JSON.parse(localStorage.getItem('dispatch_history') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0]).toEqual(entry);
    clearDispatchHistory();
    expect(localStorage.getItem('dispatch_history')).toBeNull();
  });
});
