/**
 * Created by yousef on 12/27/2024 at 4:30 PM
 * Description: utils.ts
 */

/**
 * Utility Functions
 */

export function saveToLocalStorage<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
}

export function loadFromLocalStorage<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    try {
        return item ? JSON.parse(item) : null; // Try to parse as JSON
    } catch {
        return item as unknown as T; // Return plain string if parsing fails
    }
}

export function toggleLoader(loader: HTMLElement, form: HTMLFormElement, show: boolean): void {
    if (show) {
        loader.classList.remove("hidden");
        form.querySelectorAll("input, button, textarea, select").forEach((control) => {
            control.setAttribute("disabled", "true");
        });
    } else {
        loader.classList.add("hidden");
        form.querySelectorAll("input, button, textarea, select").forEach((control) => {
            control.removeAttribute("disabled");
        });
    }
}
