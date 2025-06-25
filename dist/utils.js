/**
 * Created by yousef on 12/27/2024 at 4:30 PM
 * Description: utils.ts
 */
/**
 * Utility Functions
 */
export function saveToLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}
export function loadFromLocalStorage(key) {
    const item = localStorage.getItem(key);
    try {
        return item ? JSON.parse(item) : null; // Try to parse as JSON
    }
    catch (_a) {
        return item; // Return plain string if parsing fails
    }
}
export function toggleLoader(loader, form, show) {
    if (show) {
        loader.classList.remove("hidden");
        form.querySelectorAll("input, button, textarea, select").forEach((control) => {
            control.setAttribute("disabled", "true");
        });
    }
    else {
        loader.classList.add("hidden");
        form.querySelectorAll("input, button, textarea, select").forEach((control) => {
            control.removeAttribute("disabled");
        });
    }
}
