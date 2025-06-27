import { saveToLocalStorage, loadFromLocalStorage, toggleLoader } from '../src/utils';

describe('utils', () => {
  beforeEach(() => {
    localStorage.clear();
    document.body.innerHTML = '';
  });

  test('save and load object from localStorage', () => {
    saveToLocalStorage('obj', { a: 1 });
    expect(loadFromLocalStorage<{ a: number }>('obj')).toEqual({ a: 1 });
  });

  test('load plain string from localStorage', () => {
    localStorage.setItem('plain', 'hello');
    expect(loadFromLocalStorage('plain')).toBe('hello');
  });

  test('toggleLoader enables and disables form controls', () => {
    document.body.innerHTML = `
      <div id="loader" class="hidden"></div>
      <form id="form">
        <input type="text" />
        <button type="submit">Send</button>
      </form>`;
    const loader = document.getElementById('loader') as HTMLElement;
    const form = document.getElementById('form') as HTMLFormElement;

    toggleLoader(loader, form, true);
    expect(loader.classList.contains('hidden')).toBe(false);
    form.querySelectorAll('input, button, textarea, select').forEach(el => {
      expect(el.hasAttribute('disabled')).toBe(true);
    });

    toggleLoader(loader, form, false);
    expect(loader.classList.contains('hidden')).toBe(true);
    form.querySelectorAll('input, button, textarea, select').forEach(el => {
      expect(el.hasAttribute('disabled')).toBe(false);
    });
  });
});
