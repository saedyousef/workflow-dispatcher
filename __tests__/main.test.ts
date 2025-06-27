jest.mock('../src/utils', () => ({
  loadFromLocalStorage: jest.fn(() => null),
  saveToLocalStorage: jest.fn(),
  toggleLoader: jest.fn(),
}));

jest.mock('../src/workflow', () => ({
  dispatchWorkflow: jest.fn().mockResolvedValue({ ok: true }),
  saveDispatchHistory: jest.fn(),
  clearDispatchHistory: jest.fn(),
}));

jest.mock('../src/dom', () => ({
  displayDispatchHistory: jest.fn(),
}));

function setupDOM() {
  document.body.innerHTML = `
    <form id="dispatch-form"></form>
    <div id="payload-container"></div>
    <button id="add-payload-field"></button>
    <input id="save-pat" type="checkbox" />
    <input id="log-history" type="checkbox" />
    <div class="loading-container hidden"></div>
    <input id="theme-switch" type="checkbox" />
    <button id="clear-history"></button>
    <button id="confirm-clear-history-btn"></button>
  `;
}

describe('main module', () => {
  beforeEach(() => {
    jest.resetModules();
    setupDOM();
    (global as any).MicroModal = { init: jest.fn(), show: jest.fn(), close: jest.fn() };
  });

  test('DOMContentLoaded displays history', () => {
    const { displayDispatchHistory } = require('../src/dom');
    require('../src/main');
    window.dispatchEvent(new Event('DOMContentLoaded'));
    expect(displayDispatchHistory).toHaveBeenCalled();
  });

  test('theme switch saves preference', () => {
    const { saveToLocalStorage } = require('../src/utils');
    require('../src/main');
    const switchEl = document.getElementById('theme-switch') as HTMLInputElement;
    switchEl.checked = true;
    switchEl.dispatchEvent(new Event('change'));
    expect(document.body.classList.contains('dark')).toBe(true);
    expect(saveToLocalStorage).toHaveBeenCalledWith('theme', 'dark');
  });
});
