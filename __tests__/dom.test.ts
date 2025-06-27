import { formatTimestamp, displayDispatchHistory, showDispatchDetails } from '../src/dom';
import { Status, DispatchHistoryEntry } from '../src/types';

function expectedFormat(iso: string) {
  const date = new Date(iso);
  const day = date.getDate();
  let suffix = 'th';
  if (!(day > 3 && day < 21)) {
    switch (day % 10) {
      case 1: suffix = 'st'; break;
      case 2: suffix = 'nd'; break;
      case 3: suffix = 'rd'; break;
    }
  }
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();
  const time = date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return `${day}${suffix} ${month} ${year} ${time}`;
}

describe('dom helpers', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <table id="dispatch-history-table"><tbody></tbody></table>
      <div id="dispatch-details-content"></div>`;
    (global as any).MicroModal = { show: jest.fn() };
  });

  test('formatTimestamp creates readable string', () => {
    const iso = '2024-05-01T10:05:00Z';
    expect(formatTimestamp(iso)).toBe(expectedFormat(iso));
  });

  test('displayDispatchHistory renders rows and empty message', () => {
    const entry: DispatchHistoryEntry = {
      owner: 'o',
      repo: 'r',
      workflow: 'wf',
      ref: 'main',
      payload: {},
      timestamp: '2024-05-01T10:05:00Z',
      status: Status.Success,
      errorMessage: null,
    };
    displayDispatchHistory([entry]);
    const rows = document.querySelectorAll('#dispatch-history-table tbody tr');
    expect(rows).toHaveLength(1);
    const cells = rows[0].querySelectorAll('td');
    expect(cells[0].textContent).toBe('o');
    expect(cells[1].textContent).toBe('r');
    expect(cells[3].textContent).toBe('success');

    displayDispatchHistory([]);
    const cell = document.querySelector('#dispatch-history-table tbody td');
    expect(cell?.textContent).toBe('No dispatch history available.');
  });

  test('showDispatchDetails populates modal and triggers MicroModal', () => {
    const entry: DispatchHistoryEntry = {
      owner: 'o',
      repo: 'r',
      workflow: 'wf',
      ref: 'main',
      payload: { foo: 'bar' },
      timestamp: '2024-05-01T10:05:00Z',
      status: Status.Success,
      errorMessage: null,
    };
    showDispatchDetails(entry);
    const content = document.getElementById('dispatch-details-content')!;
    expect(content.textContent).toContain('o/r');
    expect((global as any).MicroModal.show).toHaveBeenCalled();
  });
});
